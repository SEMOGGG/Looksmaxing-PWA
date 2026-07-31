import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Budget mensuel réel, partagé par TOUTES les fonctionnalités IA (Coach IA
// + analyses par photo), calculé sur les tokens effectivement facturés par
// l'API — c'est ce chiffre, pas un nombre de messages ou une limite
// journalière arbitraire, qui garantit un coût par membre sous 3€/mois.
export const MONTHLY_AI_BUDGET_USD = 2.5;

// Tarifs arrondis au-dessus de la réalité (marge de sécurité). Haiku sert
// au Coach IA (chat), Sonnet aux analyses par photo (corps/peau), plus
// coûteux mais utilisé ponctuellement plutôt qu'en conversation.
const HAIKU_PRICE_INPUT_USD = 1;
const HAIKU_PRICE_OUTPUT_USD = 5;
const SONNET_PRICE_INPUT_USD = 4;
const SONNET_PRICE_OUTPUT_USD = 20;

function startOfMonthIso(): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function sumTokens(rows: { input_tokens: number | null; output_tokens: number | null }[]) {
  return rows.reduce(
    (acc, row) => ({
      input: acc.input + (row.input_tokens ?? 0),
      output: acc.output + (row.output_tokens ?? 0),
    }),
    { input: 0, output: 0 }
  );
}

// Coût estimé du mois calendaire en cours pour ce membre, tous usages IA
// confondus (Coach IA + analyse corporelle + analyse de peau).
export async function getMonthlyAiCostUsd(userId: string): Promise<number> {
  const supabase = getSupabaseServerClient();
  const since = startOfMonthIso();

  const [coach, body, skin] = await Promise.all([
    supabase
      .from("coach_messages")
      .select("input_tokens, output_tokens")
      .eq("user_id", userId)
      .eq("role", "assistant")
      .gte("created_at", since),
    supabase.from("body_analyses").select("input_tokens, output_tokens").eq("user_id", userId).gte("created_at", since),
    supabase.from("skin_analyses").select("input_tokens, output_tokens").eq("user_id", userId).gte("created_at", since),
  ]);

  const haiku = sumTokens(coach.data ?? []);
  const sonnet = sumTokens([...(body.data ?? []), ...(skin.data ?? [])]);

  return (
    (haiku.input / 1_000_000) * HAIKU_PRICE_INPUT_USD +
    (haiku.output / 1_000_000) * HAIKU_PRICE_OUTPUT_USD +
    (sonnet.input / 1_000_000) * SONNET_PRICE_INPUT_USD +
    (sonnet.output / 1_000_000) * SONNET_PRICE_OUTPUT_USD
  );
}
