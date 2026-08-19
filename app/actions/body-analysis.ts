"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData } from "@/app/actions/user-data";
import { photoDataUrlSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMonthlyAiCostUsd, MONTHLY_AI_BUDGET_USD } from "@/lib/ai-usage";
import { extractJsonObject } from "@/lib/claude-json";

// Modèle plus capable que le Coach IA (Sonnet plutôt que Haiku) pour une
// meilleure qualité de lecture d'image. Le coût réel est encadré par le
// budget mensuel partagé (lib/ai-usage.ts), pas par une limite de nombre
// d'analyses par jour.
const BODY_ANALYSIS_MODEL = "claude-sonnet-5";

// Anti double-soumission (double-clic, requêtes concurrentes), pas une
// vraie limite produit.
const RESUBMIT_COOLDOWN_SECONDS = 30;

export type BodyAnalysisResult = {
  rangeLow: number | null;
  rangeHigh: number | null;
  notes: string;
  createdAt: string;
};

type BodyAnalysisRow = {
  range_low: number | null;
  range_high: number | null;
  notes: string;
  created_at: string;
};

function rowToResult(row: BodyAnalysisRow): BodyAnalysisResult {
  return { rangeLow: row.range_low, rangeHigh: row.range_high, notes: row.notes, createdAt: row.created_at };
}

export async function getLatestBodyAnalysis(): Promise<BodyAnalysisResult | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("body_analyses")
    .select("range_low, range_high, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<BodyAnalysisRow>();

  return data ? rowToResult(data) : null;
}

type TextBlock = { type: "text"; text: string };

const ANALYSIS_PROMPT = `Analyse cette photo corporelle et donne une ESTIMATION VISUELLE APPROXIMATIVE du pourcentage de graisse corporelle. Ce n'est pas une mesure clinique — seuls des examens comme le DEXA ou l'impédancemétrie le sont — reste donc prudent et donne une fourchette large plutôt qu'un chiffre précis.

Réponds uniquement avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"rangeLow": <nombre ou null>, "rangeHigh": <nombre ou null>, "notes": "<2 à 3 phrases d'observations générales et bienveillantes, en français>"}

Si la photo ne permet pas d'évaluer (angle, vêtements couvrants, cadrage insuffisant), mets rangeLow et rangeHigh à null et explique pourquoi dans notes.`;

export async function analyzeBodyComposition(
  photoDataUrl: string
): Promise<{ ok: true; result: BodyAnalysisResult } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour utiliser cette fonctionnalité." };

  const allowed = await checkRateLimit("photoAnalysis", userId);
  if (!allowed) return { ok: false, error: "Trop de tentatives, patientez avant de réessayer." };

  const { plan } = await getUserData();
  if (plan !== "premium") return { ok: false, error: "Fonctionnalité réservée aux membres Premium." };

  const monthlyCost = await getMonthlyAiCostUsd(userId);
  if (monthlyCost >= MONTHLY_AI_BUDGET_USD) {
    return {
      ok: false,
      error:
        "Le Coach IA et les analyses par photo ont atteint leur plafond d'usage pour ce mois-ci. Ça redevient disponible le mois prochain.",
    };
  }

  const supabase = getSupabaseServerClient();

  const cooldownStart = new Date(Date.now() - RESUBMIT_COOLDOWN_SECONDS * 1000);
  const { data: recent } = await supabase
    .from("body_analyses")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", cooldownStart.toISOString())
    .limit(1);

  if (recent && recent.length > 0) {
    return { ok: false, error: "Une analyse est déjà en cours, patientez quelques secondes." };
  }

  const parsedPhoto = photoDataUrlSchema.safeParse(photoDataUrl);
  if (!parsedPhoto.success) return { ok: false, error: parsedPhoto.error.issues[0]?.message ?? "Photo invalide." };
  const match = parsedPhoto.data.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Photo invalide." };
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
        model: BODY_ANALYSIS_MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: ANALYSIS_PROMPT },
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

  let parsed: { rangeLow: number | null; rangeHigh: number | null; notes: string };
  try {
    parsed = JSON.parse(extractJsonObject(text));
  } catch {
    return { ok: false, error: "Réponse inattendue de l'analyse, réessayez." };
  }

  const { error } = await supabase.from("body_analyses").insert({
    user_id: userId,
    range_low: parsed.rangeLow,
    range_high: parsed.rangeHigh,
    notes: parsed.notes,
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  });
  if (error) {
    return {
      ok: false,
      error: `Une erreur est survenue lors de l'enregistrement (${error.code ?? "?"} : ${error.message}).`,
    };
  }

  return {
    ok: true,
    result: {
      rangeLow: parsed.rangeLow,
      rangeHigh: parsed.rangeHigh,
      notes: parsed.notes,
      createdAt: new Date().toISOString(),
    },
  };
}
