"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData, saveUserProfile } from "@/app/actions/user-data";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMonthlyAiCostUsd, MONTHLY_AI_BUDGET_USD } from "@/lib/ai-usage";
import { extractJsonObject } from "@/lib/claude-json";
import { photoDataUrlSchema } from "@/lib/validation";
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

export type StoredBilan = AnalysisResult & {
  createdAt: string;
  photoDataUrl: string | null;
  photoProfileDataUrl: string | null;
  photoBodyDataUrl: string | null;
};

// Photos apportées pour ce bilan précis (ex. depuis /analyse pour un suivi
// hebdomadaire), sans passer par l'onboarding. Un champ laissé vide retombe
// sur la photo déjà enregistrée dans le profil.
export type NewBilanPhotos = {
  photoDataUrl?: string | null;
  photoProfileDataUrl?: string | null;
  photoBodyDataUrl?: string | null;
};

type BilanRow = {
  overall_score: number;
  categories: AnalysisCategory[];
  created_at: string;
  photo_data_url: string | null;
  photo_profile_data_url: string | null;
  photo_body_data_url: string | null;
};

function rowToStoredBilan(row: BilanRow): StoredBilan {
  return {
    overallScore: row.overall_score,
    categories: row.categories,
    createdAt: row.created_at,
    photoDataUrl: row.photo_data_url,
    photoProfileDataUrl: row.photo_profile_data_url,
    photoBodyDataUrl: row.photo_body_data_url,
  };
}

export async function getLatestBilan(): Promise<StoredBilan | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("bilans")
    .select("overall_score, categories, created_at, photo_data_url, photo_profile_data_url, photo_body_data_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<BilanRow>();

  return data ? rowToStoredBilan(data) : null;
}

// Historique complet (le plus récent en premier), pour le graphique de
// progression et le suivi photo sur la page Compte — jamais de données
// fictives.
export async function getBilanHistory(): Promise<StoredBilan[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("bilans")
    .select("overall_score, categories, created_at, photo_data_url, photo_profile_data_url, photo_body_data_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24)
    .returns<BilanRow[]>();

  return (data ?? []).map(rowToStoredBilan);
}

type TextBlock = { type: "text"; text: string };
type ImageBlock = { type: "image"; source: { type: "base64"; media_type: string; data: string } };

function buildBilanPrompt(hasBodyPhoto: boolean, previousCategories?: AnalysisCategory[] | null): string {
  const photoList = hasBodyPhoto
    ? `Tu reçois 3 photos, dans cet ordre : (1) visage de face, (2) visage de profil, (3) corps.`
    : `Tu reçois 2 photos, dans cet ordre : (1) visage de face, (2) visage de profil. Aucune photo de corps n'a été fournie.`;

  const bodyRule = hasBodyPhoto
    ? `La photo 3 (corps) te permet d'évaluer "posture", "tonus" et "composition" à partir de ce qui y est réellement visible — reste prudent, une estimation visuelle large plutôt qu'un chiffre trop précis.`
    : `Aucune photo de corps n'a été fournie : pour "posture", "tonus" et "composition", tu DOIS mettre un score neutre de 70, "isFocus": false, et une phrase du type "Pas assez visible sur les photos fournies pour évaluer ce point — ajoutez une photo de corps pour une estimation plus précise." N'invente JAMAIS d'observation sur la silhouette, la graisse corporelle ou la masse musculaire à partir des seules photos de visage : c'est trompeur et potentiellement décourageant à tort pour la personne.`;

  const trendContext = previousCategories?.length
    ? `\nPour information, voici les scores de la précédente analyse de cette même personne (issus de photos différentes, prises à un autre moment) : ${previousCategories
        .map((c) => `${c.key}: ${c.score}/100`)
        .join(", ")}. Si tu observes un changement réel et notable par rapport à ces photos précédentes, tu peux le mentionner brièvement et avec bienveillance dans la phrase de synthèse correspondante (ex. "en progression depuis votre dernière analyse"). Si tu ne peux pas juger avec confiance d'un changement réel (angle, lumière ou cadrage différents), ne prétends rien sur une évolution et décris simplement l'état actuel.\n`
    : "";

  return `Analyse ces photos dans le cadre d'une application de coaching bien-être et apparence, de façon bienveillante et constructive — jamais critique ni dévalorisante.

${photoList}
${trendContext}
Pour chacune de ces 5 catégories, donne un score de 0 à 100 (jamais en dessous de 40, l'évaluation doit rester encourageante) et une phrase de synthèse bienveillante en français :
- "visage" (visage & symétrie, à partir des photos de face et de profil)
- "peau" (grain, teint, texture visibles sur le visage)
- "posture"
- "tonus" (tonus musculaire)
- "composition" (composition corporelle générale — silhouette, sèche, masse musculaire)

${bodyRule}

Marque "isFocus": true pour au maximum 2 catégories parmi celles réellement évaluables (celles avec le plus de marge de progression, présentées comme des opportunités, jamais comme des défauts), et false pour les autres (déjà des points forts ou non évaluables).

Ne commente jamais l'origine ethnique, le genre, l'âge perçu, un handicap visible ou toute autre caractéristique protégée — reste centré uniquement sur les 5 catégories ci-dessus.

Réponds uniquement avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"categories": [{"key": "visage", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "peau", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "posture", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "tonus", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "composition", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}]}`;
}

function parsePhotoDataUrl(dataUrl: string): { mediaType: string; base64Data: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64Data: match[2] };
}

export async function generateBilan(
  newPhotos?: NewBilanPhotos
): Promise<{ ok: true; result: StoredBilan } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour générer votre bilan." };

  const allowed = await checkRateLimit("photoAnalysis", userId);
  if (!allowed) return { ok: false, error: "Trop de tentatives, patientez avant de réessayer." };

  const { profile, plan } = await getUserData();
  if (!profile) {
    return { ok: false, error: "Complétez votre profil avant de générer un bilan personnalisé par IA." };
  }

  // Une photo apportée pour ce bilan précis (suivi hebdomadaire depuis
  // /analyse) prend le pas sur celle du profil ; sinon on retombe dessus.
  for (const [key, value] of Object.entries(newPhotos ?? {})) {
    if (value) {
      const parsed = photoDataUrlSchema.safeParse(value);
      if (!parsed.success) {
        return { ok: false, error: `${parsed.error.issues[0]?.message ?? "Photo invalide."} (${key})` };
      }
    }
  }

  const photoDataUrl = newPhotos?.photoDataUrl || profile.photoDataUrl;
  const photoProfileDataUrl = newPhotos?.photoProfileDataUrl || profile.photoProfileDataUrl;
  const photoBodyDataUrl = newPhotos?.photoBodyDataUrl || profile.photoBodyDataUrl;

  if (!photoDataUrl || !photoProfileDataUrl) {
    return {
      ok: false,
      error: "Ajoutez au moins une photo de face et une photo de profil pour générer un bilan personnalisé par IA.",
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
        error: "1 bilan par mois inclus dans le plan gratuit. Passez au Premium pour un suivi hebdomadaire illimité.",
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

  // Bilan précédent (avant l'insertion du nouveau) : sert de contexte au
  // prompt pour que les phrases de synthèse puissent noter une évolution
  // réelle plutôt que de toujours décrire un instantané isolé.
  const { data: previousRow } = await supabase
    .from("bilans")
    .select("categories")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ categories: AnalysisCategory[] }>();

  const face = parsePhotoDataUrl(photoDataUrl);
  const sideProfile = parsePhotoDataUrl(photoProfileDataUrl);
  if (!face || !sideProfile) return { ok: false, error: "Photo de face ou de profil invalide." };
  const body = photoBodyDataUrl ? parsePhotoDataUrl(photoBodyDataUrl) : null;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "Configuration serveur manquante." };

  const content: (TextBlock | ImageBlock)[] = [
    { type: "text", text: "Photo 1 — visage de face :" },
    { type: "image", source: { type: "base64", media_type: face.mediaType, data: face.base64Data } },
    { type: "text", text: "Photo 2 — visage de profil :" },
    { type: "image", source: { type: "base64", media_type: sideProfile.mediaType, data: sideProfile.base64Data } },
  ];
  if (body) {
    content.push({ type: "text", text: "Photo 3 — corps :" });
    content.push({ type: "image", source: { type: "base64", media_type: body.mediaType, data: body.base64Data } });
  }
  content.push({ type: "text", text: buildBilanPrompt(Boolean(body), previousRow?.categories) });

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
        messages: [{ role: "user", content }],
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
    parsed = JSON.parse(extractJsonObject(text));
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
    photo_data_url: photoDataUrl,
    photo_profile_data_url: photoProfileDataUrl,
    photo_body_data_url: photoBodyDataUrl,
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  });
  if (error) {
    return { ok: false, error: `Une erreur est survenue lors de l'enregistrement (${error.message}).` };
  }

  // Si de nouvelles photos ont été apportées pour ce bilan, elles deviennent
  // les photos courantes du profil (best-effort : un échec ici ne doit pas
  // faire perdre le bilan qui, lui, a déjà été généré et enregistré).
  if (newPhotos?.photoDataUrl || newPhotos?.photoProfileDataUrl || newPhotos?.photoBodyDataUrl) {
    await saveUserProfile({
      ...profile,
      photoDataUrl,
      photoProfileDataUrl,
      photoBodyDataUrl,
    });
  }

  return {
    ok: true,
    result: {
      overallScore,
      categories,
      createdAt: new Date().toISOString(),
      photoDataUrl,
      photoProfileDataUrl,
      photoBodyDataUrl,
    },
  };
}
