import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_REPUTATION_TIERS,
  DEFAULT_CHAD_SLOTS,
  DEFAULT_CHAD_MIN_POINTS,
  DEFAULT_MEDIA_UNLOCK_THRESHOLD,
  type ReputationTier,
} from "@/lib/community";

// Lecture des données gérables depuis /admin (paliers de réputation,
// réglages, ajustements de points manuels) : partagée entre les pages
// publiques (app/(app)/communaute/actions.ts) et le back-office
// (app/admin/actions/*.ts), pour ne jamais dupliquer la logique de lecture.

export async function getReputationTiersDb(
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<ReputationTier[]> {
  const { data } = await supabase
    .from("reputation_tiers")
    .select("id, label, min_points")
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return DEFAULT_REPUTATION_TIERS;
  return data.map((row) => ({ id: row.id, label: row.label, minPoints: row.min_points }));
}

export type CommunitySettings = {
  chadSlots: number;
  chadMinPoints: number;
  mediaUnlockThreshold: number;
};

function settingNumber(map: Map<string, unknown>, key: string, fallback: number): number {
  const value = map.get(key);
  return typeof value === "number" ? value : fallback;
}

export async function getCommunitySettings(
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<CommunitySettings> {
  const { data } = await supabase.from("app_settings").select("key, value");
  const map = new Map((data ?? []).map((row) => [row.key, row.value] as const));

  return {
    chadSlots: settingNumber(map, "chad_slots", DEFAULT_CHAD_SLOTS),
    chadMinPoints: settingNumber(map, "chad_min_points", DEFAULT_CHAD_MIN_POINTS),
    mediaUnlockThreshold: settingNumber(map, "media_unlock_threshold", DEFAULT_MEDIA_UNLOCK_THRESHOLD),
  };
}

// Bonus/malus manuels accordés par un admin (community_point_adjustments),
// regroupés par utilisateur. Optionnellement restreint à une liste
// d'auteurs pour éviter de charger toute la table sur un fil de discussion.
export async function getPointAdjustmentTotals(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  userIds?: string[]
): Promise<Record<string, number>> {
  let query = supabase.from("community_point_adjustments").select("user_id, points");
  if (userIds) {
    if (userIds.length === 0) return {};
    query = query.in("user_id", userIds);
  }
  const { data } = await query;

  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    totals[row.user_id] = (totals[row.user_id] ?? 0) + row.points;
  }
  return totals;
}
