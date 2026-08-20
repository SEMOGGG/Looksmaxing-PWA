"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData } from "@/app/actions/user-data";
import { getSkincareIngredients } from "@/app/actions/skincare";
import { photoDataUrlSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getMonthlyAiCostUsd, MONTHLY_AI_BUDGET_USD } from "@/lib/ai-usage";
import { extractJsonObject } from "@/lib/claude-json";

// Même logique que l'estimation de composition corporelle : modèle plus
// capable (usage ponctuel), coût réel encadré par le budget mensuel
// partagé plutôt que par un nombre d'analyses par jour. Aucune
// conservation de la photo.
const SKIN_ANALYSIS_MODEL = "claude-sonnet-5";

// Anti double-soumission, pas une vraie limite produit.
const RESUBMIT_COOLDOWN_SECONDS = 30;

export type SkinAnalysisResult = {
  points: string[];
  recommendedIngredients: string[];
  notes: string;
  createdAt: string;
};

type SkinAnalysisRow = {
  points: string[];
  recommended_ingredients: string[];
  notes: string;
  created_at: string;
};

function rowToResult(row: SkinAnalysisRow): SkinAnalysisResult {
  return {
    points: row.points,
    recommendedIngredients: row.recommended_ingredients,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getLatestSkinAnalysis(): Promise<SkinAnalysisResult | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("skin_analyses")
    .select("points, recommended_ingredients, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SkinAnalysisRow>();

  return data ? rowToResult(data) : null;
}

type TextBlock = { type: "text"; text: string };

function buildPrompt(ingredientNames: string): string {
  return `Analyse cette photo de visage et donne une évaluation générale de l'état de la peau (pas un diagnostic dermatologique) : brillance/zones sèches, texture, pores visibles, rougeurs apparentes, signes de déshydratation.

Recommande uniquement parmi ces ingrédients déjà présents dans l'application (ne recommande rien d'autre) : ${ingredientNames}.

Réponds uniquement avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"points": ["<observation 1>", "<observation 2>", "..."], "recommendedIngredients": ["<nom exact d'un ingrédient de la liste>", "..."], "notes": "<1 à 2 phrases bienveillantes de synthèse, en français>"}

Si la photo ne permet pas d'évaluer (angle, éclairage, maquillage couvrant), mets points et recommendedIngredients à des tableaux vides et explique pourquoi dans notes.`;
}

export async function analyzeSkin(
  photoDataUrl: string
): Promise<{ ok: true; result: SkinAnalysisResult } | { ok: false; error: string }> {
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
    .from("skin_analyses")
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

  const ingredients = await getSkincareIngredients();
  const ingredientNames = ingredients.map((i) => i.name).join(", ");

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
        model: SKIN_ANALYSIS_MODEL,
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: buildPrompt(ingredientNames) },
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

  let parsed: { points: string[]; recommendedIngredients: string[]; notes: string };
  try {
    parsed = JSON.parse(extractJsonObject(text));
  } catch {
    return { ok: false, error: "Réponse inattendue de l'analyse, réessayez." };
  }

  const { error } = await supabase.from("skin_analyses").insert({
    user_id: userId,
    points: parsed.points ?? [],
    recommended_ingredients: parsed.recommendedIngredients ?? [],
    notes: parsed.notes ?? "",
    input_tokens: data.usage?.input_tokens ?? 0,
    output_tokens: data.usage?.output_tokens ?? 0,
  });
  if (error) return { ok: false, error: "Une erreur est survenue lors de l'enregistrement." };

  return {
    ok: true,
    result: {
      points: parsed.points ?? [],
      recommendedIngredients: parsed.recommendedIngredients ?? [],
      notes: parsed.notes ?? "",
      createdAt: new Date().toISOString(),
    },
  };
}
