"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserData } from "@/app/actions/user-data";
import {
  COACH_MODEL,
  COACH_SYSTEM_PROMPT,
  MAX_CONTEXT_MESSAGES,
  MAX_DAILY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_REPLY_TOKENS,
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

async function callClaude(messages: { role: "user" | "assistant"; content: string }[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante : configurez-la dans les variables d'environnement.");
  }

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
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string" || !text) {
    throw new Error("Réponse du modèle vide ou inattendue.");
  }
  return text;
}

export async function sendCoachMessage(
  content: string
): Promise<{ ok: true; messages: CoachMessage[] } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour parler au coach." };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Votre message est vide." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "Votre message est trop long, essayez de le raccourcir." };
  }

  const { plan } = await getUserData();
  if (plan !== "premium") {
    return { ok: false, error: "Le Coach IA est réservé aux membres Premium." };
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
    const reply = await callClaude(context);
    await supabase.from("coach_messages").insert({ user_id: userId, role: "assistant", content: reply });
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
