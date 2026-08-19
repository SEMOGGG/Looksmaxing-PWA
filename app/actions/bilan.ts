"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData } from "@/app/actions/user-data";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMonthlyAiCostUsd, MONTHLY_AI_BUDGET_USD } from "@/lib/ai-usage";
import type { AnalysisCategory, AnalysisResult } from "@/lib/analysis";

const BILAN_MODEL = "claude-sonnet-5";
const RESUBMIT_COOLDOWN_SECONDS = 30;

const CATEGORY_LABELS: Record<string, string> = {
  visage: "Visage & symétrie",
  peau: "Peau",
  posture: "Posture",
  tonus: "Tonus musculaire",
  composition: "Composition corporelle",
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

export type StoredBilan = AnalysisResult & { createdAt: string };

type BilanRow = {
  overall_score: number;
  categories: AnalysisCategory[];
  created_at: string;
};

export async function getLatestBilan(): Promise<StoredBilan | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("bilans")
    .select("overall_score, categories, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<BilanRow>();

  if (!data) return null;
  return { overallScore: data.overall_score, categories: data.categories, createdAt: data.created_at };
}

// Historique complet (le plus récent en premier), pour le graphique de
// progression et la liste sur la page Compte — jamais de données fictives.
export async function getBilanHistory(): Promise<StoredBilan[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("bilans")
    .select("overall_score, categories, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24)
    .returns<BilanRow[]>();

  return (data ?? []).map((row) => ({
    overallScore: row.overall_score,
    categories: row.categories,
    createdAt: row.created_at,
  }));
}

type TextBlock = { type: "text"; text: string };

const BILAN_PROMPT = `Analyse cette photo de profil dans le cadre d'une application de coaching bien-être et apparence, de façon bienveillante et constructive — jamais critique ni dévalorisante.

D'abord, détermine ce qui est réellement visible sur la photo : uniquement le visage (portrait/selfie serré), ou aussi le torse/corps (photo plus large, en pied ou buste dégagé).

Pour chacune de ces 5 catégories, donne un score de 0 à 100 (jamais en dessous de 40, l'évaluation doit rester encourageante) et une phrase de synthèse bienveillante en français :
- "visage" (visage & symétrie) — toujours évaluable sur un portrait
- "peau" (grain, teint, texture visibles) — toujours évaluable sur un portrait
- "posture" (uniquement si le buste ou le corps entier est visible)
- "tonus" (tonus musculaire, uniquement si le torse, les bras ou le corps sont visibles — jamais depuis le seul visage)
- "composition" (composition corporelle générale — pourcentage de graisse, sèche, masse musculaire — uniquement si le torse ou le corps est visible, jamais depuis le seul visage)

Règle stricte pour "posture", "tonus" et "composition" : si seul le visage est visible sur la photo, tu DOIS mettre un score neutre de 70, "isFocus": false, et une phrase générique du type "Pas assez visible sur cette photo pour évaluer ce point — ajoutez une photo de corps pour une estimation plus précise." N'invente JAMAIS d'observation sur la silhouette, la graisse corporelle ou la masse musculaire à partir d'un simple visage : c'est trompeur et potentiellement décourageant à tort pour la personne.

Marque "isFocus": true pour au maximum 2 catégories parmi celles réellement évaluables sur la photo (celles avec le plus de marge de progression, présentées comme des opportunités, jamais comme des défauts), et false pour les autres (déjà des points forts ou non évaluables).

Ne commente jamais l'origine ethnique, le genre, l'âge perçu, un handicap visible ou toute autre caractéristique protégée — reste centré uniquement sur les 5 catégories ci-dessus.

Réponds uniquement avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"categories": [{"key": "visage", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "peau", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "posture", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "tonus", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "composition", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}]}`;

export async function generateBilan(): Promise<{ ok: true; result: StoredBilan } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour générer votre bilan." };

  const allowed = await checkRateLimit("photoAnalysis", userId);
  if (!allowed) return { ok: false, error: "Trop de tentatives, patientez avant de réessayer." };

  const { profile, plan } = await getUserData();
  if (!profile?.photoDataUrl) {
    return {
      ok: false,
      error: "Ajoutez une photo à votre profil (depuis l'onboarding) pour générer un bilan personnalisé par IA.",
    };
  }

  const supabase = getSupabaseServerClient();

  if (plan === "premium") {
    const monthlyCost = await getMonthlyAiCostUsd(userId);
    if (monthlyCost >= MONTHLY_AI_BUDGET_USD) {
      return {
        ok: false,
        error:
          "Le Coach IA et les analyses par photo ont atteint leur plafond d'usage pour ce mois-ci. Ça redevient disponible le mois prochain.",
      };
    }
  } else {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("bilans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= 1) {
      return {
        ok: false,
        error: "1 bilan par mois inclus dans le plan gratuit. Passez au Premium pour un bilan illimité.",
      };
    }
  }

  const cooldownStart = new Date(Date.now() - RESUBMIT_COOLDOWN_SECONDS * 1000);
  const { data: recent } = await supabase
    .from("bilans")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", cooldownStart.toISOString())
    .limit(1);
  if (recent && recent.length > 0) {
    return { ok: false, error: "Un bilan est déjà en cours de génération, patientez quelques secondes." };
  }

  const match = profile.photoDataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Photo de profil invalide." };
  const [, mediaType, base64Data] = match;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Configuration serveur manquante." };

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: BILAN_MODEL,
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: BILAN_PROMPT },
            ],
          },
        ],
      }),
    });
  } catch {
    return { ok: false, error: "Analyse indisponible pour le moment, réessayez plus tard." };
  }

  if (!response.ok) {
    return { ok: false, error: "Analyse indisponible pour le moment, réessayez plus tard." };
  }

  const data: { content: TextBlock[]; usage?: { input_tokens?: number; output_tokens?: number } } =
    await response.json();
  const text = data.content?.find((block) => block.type === "text")?.text ?? "";

  let parsed: { categories: { key: string; score: number; isFocus: boolean; summary: string }[] };
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: "Réponse inattendue de l'analyse, réessayez." };
  }

  const categories: AnalysisCategory[] = CATEGORY_KEYS.map((key) => {
    const found = parsed.categories?.find((c) => c.key === key);
    return {
      key,
      label: CATEGORY_LABELS[key],
      score: typeof found?.score === "number" ? Math.max(0, Math.min(100, Math.round(found.score))) : 70,
      isFocus: found?.isFocus ?? false,
      summary: found?.summary ?? "Analyse indisponible pour cette catégorie.",
    };
  });
  const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);

  const { error } = await supabase.from("bilans").insert({
    user_id: userId,
    overall_score: overallScore,
    categories,
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  });
  if (error) return { ok: false, error: "Une erreur est survenue lors de l'enregistrement." };

  return { ok: true, result: { overallScore, categories, createdAt: new Date().toISOString() } };
}
