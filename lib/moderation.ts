import "server-only";
import { extractJsonObject } from "@/lib/claude-json";

// Modération photo/vidéo de la Communauté. Haiku suffit pour une
// classification sûr/pas-sûr (pas besoin de la finesse de Sonnet), ce qui
// garde le coût par upload marginal — voir COACH_MODEL dans lib/coach.ts
// pour le même choix sur le Coach IA.
const MODERATION_MODEL = "claude-haiku-4-5-20251001";

const MODERATION_PROMPT = `Tu es un modérateur de contenu pour l'espace communautaire d'une application de coaching apparence et bien-être. Le ton doit rester sérieux et bienveillant.

Contenu STRICTEMENT INTERDIT, à refuser systématiquement : nudité, contenu à caractère sexuel ou suggestif, violence graphique ou choquante, contenu haineux, illégal ou dangereux.

Analyse l'image fournie et réponds UNIQUEMENT avec un objet JSON strict, sans texte autour ni balises markdown, au format exact :
{"safe": true ou false, "reason": "<courte raison en français si safe=false, sinon chaîne vide>"}`;

type ModerationVerdict =
  | { safe: true; reason: "" }
  | { safe: false; reason: string }
  | { safe: null; reason: string };

async function moderateOneImage(base64Data: string, mediaType: string): Promise<ModerationVerdict> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { safe: null, reason: "Modération indisponible pour le moment." };

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
        model: MODERATION_MODEL,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: MODERATION_PROMPT },
            ],
          },
        ],
      }),
    });
  } catch {
    return { safe: null, reason: "Modération indisponible, réessayez plus tard." };
  }

  if (!response.ok) return { safe: null, reason: "Modération indisponible, réessayez plus tard." };

  const data: { content?: { type: string; text?: string }[] } = await response.json();
  const text = data.content?.find((block) => block.type === "text")?.text ?? "";

  try {
    const parsed: { safe: boolean; reason?: string } = JSON.parse(extractJsonObject(text));
    return parsed.safe
      ? { safe: true, reason: "" }
      : { safe: false, reason: parsed.reason || "Ce contenu ne respecte pas les règles de la communauté." };
  } catch {
    return { safe: null, reason: "Réponse de modération inattendue, réessayez." };
  }
}

// Modère une photo, ou plusieurs frames extraites d'une vidéo : refuse dès
// qu'une seule image est jugée non sûre, ET refuse aussi si la modération
// échoue techniquement (fail-closed — on ne publie jamais un média sans
// verdict clair, plutôt que de le laisser passer par défaut).
export async function moderateMediaImages(
  images: { base64Data: string; mediaType: string }[]
): Promise<{ ok: true } | { ok: false; reason: string }> {
  for (const image of images) {
    const verdict = await moderateOneImage(image.base64Data, image.mediaType);
    if (!verdict.safe) return { ok: false, reason: verdict.reason };
  }
  return { ok: true };
}
