"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData } from "@/app/actions/user-data";
import { lookupFoodNutrition } from "@/lib/food-data";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  COACH_MODEL,
  COACH_SYSTEM_PROMPT,
  COACH_TOOLS,
  MAX_CONTEXT_MESSAGES,
  MAX_DAILY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_REPLY_TOKENS,
  MONTHLY_BUDGET_USD,
  PRICE_PER_MTOK_INPUT_USD,
  PRICE_PER_MTOK_OUTPUT_USD,
  type CoachMessage,
} from "@/lib/coach";

type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

function rowToMessage(row: MessageRow): CoachMessage {
  return { id: row.id, role: row.role, content: row.content, createdAt: row.created_at };
}

export async function getCoachHistory(): Promise<CoachMessage[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(50);

  return (data ?? []).map(rowToMessage);
}

// Coût estimé du mois calendaire en cours pour ce membre, à partir des
// tokens réellement facturés par l'API (stockés sur chaque réponse de
// l'assistant). C'est ce chiffre, pas le nombre de messages, qui garantit
// un plafond en euros par client.
async function getMonthlyUsageCostUsd(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("coach_messages")
    .select("input_tokens, output_tokens")
    .eq("user_id", userId)
    .eq("role", "assistant")
    .gte("created_at", startOfMonth.toISOString());

  const totals = (data ?? []).reduce(
    (acc, row) => ({
      input: acc.input + (row.input_tokens ?? 0),
      output: acc.output + (row.output_tokens ?? 0),
    }),
    { input: 0, output: 0 }
  );

  return (
    (totals.input / 1_000_000) * PRICE_PER_MTOK_INPUT_USD +
    (totals.output / 1_000_000) * PRICE_PER_MTOK_OUTPUT_USD
  );
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

type ApiMessage = { role: "user" | "assistant"; content: string | ContentBlock[] };

const MAX_TOOL_ROUNDS = 3;

async function runToolCall(block: Extract<ContentBlock, { type: "tool_use" }>): Promise<string> {
  if (block.name === "lookup_food_nutrition") {
    const query = typeof block.input.query === "string" ? block.input.query : "";
    return lookupFoodNutrition(query);
  }
  return `Outil inconnu : ${block.name}`;
}

// Boucle d'appel à Claude avec possibilité d'utiliser l'outil de recherche
// nutritionnelle : le modèle peut demander l'outil, on exécute la
// recherche USDA, on lui renvoie le résultat, jusqu'à une réponse finale
// en texte (plafonné à MAX_TOOL_ROUNDS allers-retours pour rester borné).
// Les tokens facturés sont cumulés sur tous les allers-retours, y compris
// les appels d'outils, pour un suivi de coût fidèle à la facture réelle.
async function callClaude(initialMessages: { role: "user" | "assistant"; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante : configurez-la dans les variables d'environnement.");
  }

  const messages: ApiMessage[] = [...initialMessages];
  let inputTokens = 0;
  let outputTokens = 0;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: COACH_MODEL,
        max_tokens: MAX_REPLY_TOKENS,
        system: COACH_SYSTEM_PROMPT,
        tools: COACH_TOOLS,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data: {
      content: ContentBlock[];
      stop_reason: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    } = await response.json();

    inputTokens += data.usage?.input_tokens ?? 0;
    outputTokens += data.usage?.output_tokens ?? 0;

    const content = data.content ?? [];

    if (data.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content });

      const toolUseBlocks = content.filter(
        (block): block is Extract<ContentBlock, { type: "tool_use" }> => block.type === "tool_use"
      );
      const toolResults: ContentBlock[] = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: await runToolCall(block),
        }))
      );
      messages.push({ role: "user", content: toolResults });
      continue;
    }

    const text = content.find((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text")
      ?.text;
    if (!text) throw new Error("Réponse du modèle vide ou inattendue.");
    return { text, inputTokens, outputTokens };
  }

  throw new Error("Trop d'appels d'outils enchaînés, réponse abandonnée.");
}

export async function sendCoachMessage(
  content: string
): Promise<{ ok: true; messages: CoachMessage[] } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour parler au coach." };

  const allowed = await checkRateLimit("coachMessage", userId);
  if (!allowed) return { ok: false, error: "Trop de messages envoyés d'un coup, patientez un instant." };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Votre message est vide." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Votre message est trop long, essayez de le raccourcir." };
  }

  const { plan } = await getUserData();
  if (plan !== "premium") {
    return { ok: false, error: "Le Coach IA est réservé aux membres Premium." };
  }

  const monthlyCost = await getMonthlyUsageCostUsd(userId);
  if (monthlyCost >= MONTHLY_BUDGET_USD) {
    return {
      ok: false,
      error: "Le Coach IA a atteint son plafond d'usage pour ce mois-ci. Il redevient disponible le mois prochain.",
    };
  }

  const supabase = getSupabaseServerClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("coach_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", startOfDay.toISOString());

  if ((count ?? 0) >= MAX_DAILY_MESSAGES) {
    return {
      ok: false,
      error: `Vous avez atteint votre limite de ${MAX_DAILY_MESSAGES} messages pour aujourd'hui. Revenez demain !`,
    };
  }

  const { error: insertUserError } = await supabase
    .from("coach_messages")
    .insert({ user_id: userId, role: "user", content: trimmed });

  if (insertUserError) return { ok: false, error: "Une erreur est survenue, réessayez." };

  const { data: recent } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_CONTEXT_MESSAGES);

  const context = (recent ?? [])
    .slice()
    .reverse()
    .map((row) => ({ role: row.role as "user" | "assistant", content: row.content }));

  try {
    const { text, inputTokens, outputTokens } = await callClaude(context);
    await supabase.from("coach_messages").insert({
      user_id: userId,
      role: "assistant",
      content: text,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    });
  } catch {
    return {
      ok: false,
      error: "Le coach est momentanément indisponible, réessayez dans un instant.",
    };
  }

  const { data: updated } = await supabase
    .from("coach_messages")
    .select("id, role, content, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(50);

  return { ok: true, messages: (updated ?? []).map(rowToMessage) };
}
