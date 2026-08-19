import "server-only";

// Claude répond parfois avec des balises markdown (```json ... ```) ou du
// texte avant/après l'objet JSON demandé, malgré la consigne explicite de ne
// répondre qu'avec du JSON strict. On nettoie systématiquement avant de
// parser, plutôt que de faire échouer toute l'analyse pour un simple habillage
// autour du JSON.
export function extractJsonObject(text: string): string {
  const withoutFences = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return withoutFences;

  return withoutFences.slice(start, end + 1);
}
