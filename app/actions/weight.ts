"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type WeightEntry = {
  id: string;
  weightKg: number;
  recordedAt: string;
};

export async function getWeightEntries(): Promise<WeightEntry[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("weight_entries")
    .select("id, weight_kg, recorded_at")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true })
    .limit(30);

  return (data ?? []).map((row) => ({
    id: row.id,
    weightKg: row.weight_kg,
    recordedAt: row.recorded_at,
  }));
}

export async function addWeightEntry(weightKg: number): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 400) return { ok: false };

  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase
    .from("weight_entries")
    .upsert({ user_id: userId, weight_kg: weightKg, recorded_at: today }, { onConflict: "user_id, recorded_at" });

  return { ok: !error };
}
