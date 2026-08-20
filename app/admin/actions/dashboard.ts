"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardStats = {
  totalUsers: number;
  premiumUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
  totalArticles: number;
  totalIngredients: number;
};

export async function getDashboardStats(): Promise<AdminDashboardStats | null> {
  const guard = await requireAdmin();
  if (!guard.ok) return null;

  const supabase = getSupabaseServerClient();
  const client = await clerkClient();

  const [
    userCount,
    { count: premiumUsers },
    { count: totalPosts },
    { count: totalComments },
    { count: pendingReports },
    { count: totalArticles },
    { count: totalIngredients },
  ] = await Promise.all([
    client.users.getCount(),
    supabase.from("user_profiles").select("user_id", { count: "exact", head: true }).eq("plan", "premium"),
    supabase.from("community_posts").select("id", { count: "exact", head: true }),
    supabase.from("community_comments").select("id", { count: "exact", head: true }),
    supabase.from("community_reports").select("id", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("community_articles").select("id", { count: "exact", head: true }),
    supabase.from("skincare_ingredients").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: userCount,
    premiumUsers: premiumUsers ?? 0,
    totalPosts: totalPosts ?? 0,
    totalComments: totalComments ?? 0,
    pendingReports: pendingReports ?? 0,
    totalArticles: totalArticles ?? 0,
    totalIngredients: totalIngredients ?? 0,
  };
}
