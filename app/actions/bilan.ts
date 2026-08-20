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
  id: string;
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
  id: string;
  overall_score: number;
  categories: AnalysisCategory[];
  created_at: string;
  photo_data_url: string | null;
  photo_profile_data_url: string | null;
  photo_body_data_url: string | null;
};

function rowToStoredBilan(row: BilanRow): StoredBilan {
  return {
    id: row.id,
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
    .select("id, overall_score, categories, created_at, photo_data_url, photo_profile_data_url, photo_body_data_url")
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
    .select("id, overall_score, categories, created_at, photo_data_url, photo_profile_data_url, photo_body_data_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24)
    .returns<BilanRow[]>();

  return (data ?? []).map(rowToStoredBilan);
}

type TextBlock = { type: "text"; text: string };
type ImageBlock = { type: "image"; source: { type: "base64"; media_type: string; data: string } };

function buildBilanPrompt(hasBodyPhoto: boolean): string {
  const photoList = hasBodyPhoto
    ? `Tu reçois 3 photos, dans cet ordre : (1) visage de face, (2) visage de profil, (3) corps.`
    : `Tu reçois 2 photos, dans cet ordre : (1) visage de face, (2) visage de profil. Aucune photo de corps n'a été fournie.`;

  const bodyRule = hasBodyPhoto
    ? `La photo 3 (corps) te permet d'évaluer "posture", "tonus" et "composition" à partir de ce qui y est réellement visible — reste prudent, une estimation visuelle large plutôt qu'un chiffre trop précis.`
    : `Aucune photo de corps n'a été fournie : pour "posture", "tonus" et "composition", tu DOIS mettre un score neutre de 70, "isFocus": false, et une phrase du type "Pas assez visible sur les photos fournies pour évaluer ce point — ajoutez une photo de corps pour une estimation plus précise." N'invente JAMAIS d'observation sur la silhouette, la graisse corporelle ou la masse musculaire à partir des seules photos de visage : c'est trompeur et potentiellement décourageant à tort pour la personne.`;

  return `Analyse ces photos dans le cadre d'une application de coaching bien-être et apparence, de façon bienveillante dans la formulation mais strictement impartiale et cohérente dans l'évaluation elle-même — jamais complaisante.

${photoList}

Règle d'impartialité stricte : évalue uniquement ce que montrent CES photos précises, sans aucune autre information de contexte. Tu ne sais rien et tu ne dois rien supposer sur d'éventuelles analyses passées de cette personne. Deux jeux de photos identiques ou très similaires doivent produire des scores quasiment identiques — ne fais jamais varier un score pour "faire plaisir", encourager une progression supposée, ou parce que la personne revient faire une nouvelle analyse. Un score ne doit changer que si ce qui est visible sur la photo a réellement changé.

Pour chacune de ces 5 catégories, donne un score de 0 à 100 (jamais en dessous de 40, la formulation doit rester encourageante mais le chiffre lui-même doit rester honnête) et une phrase de synthèse bienveillante en français, centrée uniquement sur ce qui est visible sur ces photos :
- "visage" (visage & symétrie, à partir des photos de face et de profil)
- "peau" (grain, teint, texture visibles sur le visage)
- "posture"
- "tonus" (tonus musculaire)
- "composition" (composition corporelle générale — silhouette, sèche, masse musculaire)

${bodyRule}

Marque "isFocus": true pour au maximum 2 catégories parmi celles réellement évaluables (celles avec le plus de marge de progression, présentées comme des opportunités, jamais comme des défauts), et false pour les autres (déjà des points forts ou non évaluables).

Ne commente jamais l'origine ethnique, le genre, l'âge perçu, un handicap visible ou toute autre caractéristique protégée — reste centré uniquement sur les 5 catégories ci-dessus.

RÈGLE ABSOLUE SUR CHAQUE "summary" — À RESPECTER MOT POUR MOT : tu n'as JAMAIS vu cette personne avant et tu n'as accès à AUCUNE photo ni analyse antérieure, même si la personne a peut-être déjà utilisé l'application. Chaque "summary" doit décrire UNIQUEMENT ce qui est visible sur CES photos, comme s'il s'agissait d'une toute première analyse. Il est FORMELLEMENT INTERDIT d'employer, sous quelque forme que ce soit, une formulation impliquant une comparaison, une évolution ou une continuité dans le temps — y compris (liste non exhaustive) : "depuis votre dernière analyse", "depuis la dernière fois", "en progression", "en amélioration", "continuez comme ça", "continuez ainsi", "toujours aussi", "comme précédemment", "par rapport à avant". Avant de produire ta réponse finale, relis chaque "summary" et vérifie qu'aucune de ces formulations n'y figure ; si c'est le cas, reformule-la pour ne décrire que l'état actuel, par exemple remplace "Tonus musculaire déjà bien développé, en progression depuis votre dernière analyse" par simplement "Tonus musculaire déjà bien développé, avec une belle définition visible".

Réponds uniquement avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"categories": [{"key": "visage", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "peau", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "posture", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "tonus", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}, {"key": "composition", "score": <0-100>, "isFocus": <bool>, "summary": "<phrase>"}]}`;
}

// Filet de sécurité déterministe : malgré la consigne explicite du prompt,
// Claude réintroduit parfois une formulation de comparaison temporelle
// (ex. "en progression depuis votre dernière analyse") dans un summary,
// ce qui est trompeur puisqu'aucune photo précédente ne lui est fournie.
// On la retire ici plutôt que de compter uniquement sur l'obéissance du
// modèle au prompt.
const TEMPORAL_COMPARISON_PATTERNS: RegExp[] = [
  /,?\s*(?:et\s+)?(?:en\s+)?(?:nette\s+)?(?:progression|amélioration|net progrès)\s+(?:depuis|par rapport (?:à|au))\s+[^,.]+/gi,
  /,?\s*depuis\s+(?:votre|la)\s+derni[eè]re\s+(?:analyse|fois|visite)[^,.]*/gi,
  /,?\s*continuez\s+(?:comme\s+ça|ainsi)[^,.]*/gi,
  /,?\s*toujours\s+aussi\b/gi,
  /,?\s*comme\s+pr[ée]c[ée]demment\b/gi,
];

function stripTemporalComparisons(summary: string): string {
  let result = summary;
  for (const pattern of TEMPORAL_COMPARISON_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result.replace(/\s{2,}/g, " ").replace(/\s+([.,])/g, "$1").trim();
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

  // Le paramètre `temperature` n'est plus accepté par ce modèle (voir plus
  // bas), donc rien ne garantit plus au niveau de l'appel API que deux jeux
  // de photos identiques produisent le même score d'une génération à
  // l'autre. On garantit ça nous-mêmes : si les 3 photos utilisées pour ce
  // bilan sont strictement identiques à celles du tout dernier bilan, on
  // réutilise directement son résultat plutôt que de rappeler Claude — pas
  // de dérive possible, et pas de coût ni de quota consommé pour rien.
  const { data: latestRow } = await supabase
    .from("bilans")
    .select("overall_score, categories, photo_data_url, photo_profile_data_url, photo_body_data_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<BilanRow>();

  if (
    latestRow &&
    latestRow.photo_data_url === photoDataUrl &&
    latestRow.photo_profile_data_url === photoProfileDataUrl &&
    latestRow.photo_body_data_url === photoBodyDataUrl
  ) {
    const { data: inserted, error: reuseError } = await supabase
      .from("bilans")
      .insert({
        user_id: userId,
        overall_score: latestRow.overall_score,
        categories: latestRow.categories,
        photo_data_url: photoDataUrl,
        photo_profile_data_url: photoProfileDataUrl,
        photo_body_data_url: photoBodyDataUrl,
      })
      .select("id, overall_score, categories, created_at, photo_data_url, photo_profile_data_url, photo_body_data_url")
      .single<BilanRow>();

    if (reuseError || !inserted) {
      return { ok: false, error: "Impossible d'enregistrer le bilan, réessayez." };
    }
    return { ok: true, result: rowToStoredBilan(inserted) };
  }

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
  content.push({ type: "text", text: buildBilanPrompt(Boolean(body)) });

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
        // `temperature` est refusé (400 invalid_request_error) par ce modèle
        // depuis peu : la cohérence entre générations similaires repose donc
        // uniquement sur les consignes d'impartialité du prompt ci-dessus.
        messages: [{ role: "user", content }],
      }),
    });
  } catch {
    return { ok: false, error: "Analyse indisponible, réessayez dans un instant." };
  }

  if (!response.ok) {
    return { ok: false, error: "Analyse indisponible, réessayez dans un instant." };
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
      summary: found?.summary
        ? stripTemporalComparisons(found.summary)
        : "Analyse indisponible pour cette catégorie.",
    };
  });
  const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);

  const { data: insertedRow, error } = await supabase
    .from("bilans")
    .insert({
      user_id: userId,
      overall_score: overallScore,
      categories,
      photo_data_url: photoDataUrl,
      photo_profile_data_url: photoProfileDataUrl,
      photo_body_data_url: photoBodyDataUrl,
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    })
    .select("id")
    .single();
  if (error || !insertedRow) {
    return { ok: false, error: `Une erreur est survenue lors de l'enregistrement (${error?.message ?? ""}).` };
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
      id: insertedRow.id,
      overallScore,
      categories,
      createdAt: new Date().toISOString(),
      photoDataUrl,
      photoProfileDataUrl,
      photoBodyDataUrl,
    },
  };
}

// Supprime un bilan précis (score + photos qui lui sont associées) : sert
// notamment à retirer des doublons de test qui faussent le graphique de
// progression et le suivi photo sur la page Suivi. `.eq("user_id", userId)`
// empêche de supprimer le bilan de quelqu'un d'autre même en cas d'id deviné.
export async function deleteBilan(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour gérer votre suivi." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("bilans").delete().eq("id", id).eq("user_id", userId);

  if (error) return { ok: false, error: "Impossible de supprimer ce bilan, réessayez." };
  return { ok: true };
}
