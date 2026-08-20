"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCommunitySettings, type CommunitySettings } from "@/lib/community-data.server";
import { reputationTierSchema, appSettingKeySchema, appSettingValueSchema, pointAdjustmentSchema } from "@/lib/validation";
import type { ReputationTier } from "@/lib/community";

type ActionResult = { ok: true } | { ok: false; error: string };

export type AdminReputationTier = ReputationTier & { sortOrder: number };

export async function listReputationTiersAdmin(): Promise<AdminReputationTier[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("reputation_tiers")
    .select("id, label, min_points, sort_order")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    minPoints: row.min_points,
    sortOrder: row.sort_order,
  }));
}

export async function createReputationTier(input: {
  id: string;
  label: string;
  minPoints: number;
}): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = reputationTierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Palier invalide." };

  const supabase = getSupabaseServerClient();
  const { count } = await supabase.from("reputation_tiers").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("reputation_tiers").insert({
    id: parsed.data.id,
    label: parsed.data.label,
    min_points: parsed.data.minPoints,
    sort_order: count ?? 0,
  });

  if (error) {
    return { ok: false, error: error.code === "23505" ? "Cet identifiant existe déjà." : "Impossible de créer le palier." };
  }
  revalidatePath("/communaute");
  revalidatePath("/admin/badges");
  return { ok: true };
}

export async function updateReputationTier(
  id: string,
  input: { label: string; minPoints: number }
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = reputationTierSchema.pick({ label: true, minPoints: true }).safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Palier invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("reputation_tiers")
    .update({ label: parsed.data.label, min_points: parsed.data.minPoints })
    .eq("id", id);

  if (error) return { ok: false, error: "Impossible de modifier le palier." };
  revalidatePath("/communaute");
  revalidatePath("/admin/badges");
  return { ok: true };
}

export async function deleteReputationTier(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("reputation_tiers").delete().eq("id", id);

  if (error) return { ok: false, error: "Impossible de supprimer le palier." };
  revalidatePath("/communaute");
  revalidatePath("/admin/badges");
  return { ok: true };
}

export async function getSettingsAdmin(): Promise<CommunitySettings> {
  const guard = await requireAdmin();
  if (!guard.ok) return { chadSlots: 5, chadMinPoints: 25, mediaUnlockThreshold: 200 };

  const supabase = getSupabaseServerClient();
  return getCommunitySettings(supabase);
}

export async function updateSettingAdmin(key: string, value: number): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedKey = appSettingKeySchema.safeParse(key);
  const parsedValue = appSettingValueSchema.safeParse(value);
  if (!parsedKey.success || !parsedValue.success) return { ok: false, error: "Réglage invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: parsedKey.data, value: parsedValue.data, updated_at: new Date().toISOString() });

  if (error) return { ok: false, error: "Impossible d'enregistrer ce réglage." };
  revalidatePath("/communaute");
  revalidatePath("/admin/badges");
  return { ok: true };
}

export type AdminPointAdjustment = {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdBy: string;
  createdAt: string;
};

export async function listPointAdjustmentsAdmin(userId: string): Promise<AdminPointAdjustment[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("community_point_adjustments")
    .select("id, user_id, points, reason, created_by, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    points: row.points,
    reason: row.reason,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }));
}

export async function addPointAdjustmentAdmin(input: {
  userId: string;
  points: number;
  reason: string;
}): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = pointAdjustmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ajustement invalide." };

  const supabase = getSupabaseServerClient();
  const { userId: adminId } = await auth();

  const { error } = await supabase.from("community_point_adjustments").insert({
    user_id: parsed.data.userId,
    points: parsed.data.points,
    reason: parsed.data.reason,
    created_by: adminId ?? "admin",
  });

  if (error) return { ok: false, error: "Impossible d'enregistrer l'ajustement." };
  revalidatePath("/communaute");
  revalidatePath("/admin/badges");
  return { ok: true };
}
