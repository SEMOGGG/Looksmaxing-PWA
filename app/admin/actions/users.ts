"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { planSchema, onboardingProfileSchema } from "@/lib/validation";
import { getReputationTiersDb, getPointAdjustmentTotals } from "@/lib/community-data.server";
import { getReputationTier } from "@/lib/community";
import type { Plan } from "@/lib/user-data";
import type { OnboardingData } from "@/lib/onboarding";
import type { FaceShape } from "@/lib/hair";

type ActionResult = { ok: true } | { ok: false; error: string };

export type AdminUserSummary = {
  id: string;
  displayName: string;
  email: string | null;
  imageUrl: string;
  createdAt: string;
  plan: Plan;
};

type ProfileRow = {
  user_id: string;
  plan: string;
};

export async function listUsersAdmin(query?: string): Promise<AdminUserSummary[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({
    query: query?.trim() || undefined,
    limit: 50,
    orderBy: "-created_at",
  });

  if (clerkUsers.length === 0) return [];

  const supabase = getSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, plan")
    .in("user_id", clerkUsers.map((u) => u.id))
    .returns<ProfileRow[]>();
  const planByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.plan]));

  return clerkUsers.map((user) => ({
    id: user.id,
    displayName: user.fullName || user.username || "Sans nom",
    email: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
    createdAt: new Date(user.createdAt).toISOString(),
    plan: planByUser.get(user.id) === "premium" ? "premium" : "free",
  }));
}

export type AdminUserDetail = {
  id: string;
  displayName: string;
  email: string | null;
  imageUrl: string;
  createdAt: string;
  plan: Plan;
  profile: OnboardingData | null;
  faceShape: FaceShape | null;
  contributionCount: number;
  points: number;
  reputationLabel: string;
};

export async function getUserDetailAdmin(userId: string): Promise<AdminUserDetail | null> {
  const guard = await requireAdmin();
  if (!guard.ok) return null;

  const client = await clerkClient();
  let clerkUser;
  try {
    clerkUser = await client.users.getUser(userId);
  } catch {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const [{ data: profileRow }, { data: postRowsRaw }, { data: commentRowsRaw }, adjustments, tiers] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select(
          "plan, consent_given, photo_data_url, photo_profile_data_url, photo_body_data_url, age, sex, height_cm, weight_kg, activity_level, steps, goals, face_shape"
        )
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("community_posts")
        .select("id, likes_count")
        .eq("author_id", userId)
        .returns<{ id: string; likes_count: number }[]>(),
      supabase
        .from("community_comments")
        .select("id, helpful_count")
        .eq("author_id", userId)
        .returns<{ id: string; helpful_count: number }[]>(),
      getPointAdjustmentTotals(supabase, [userId]),
      getReputationTiersDb(supabase),
    ]);

  const postRows = postRowsRaw ?? [];
  const commentRows = commentRowsRaw ?? [];
  const contributionCount = postRows.length + commentRows.length;
  const points =
    postRows.reduce((sum, p) => sum + (p.likes_count ?? 0), 0) +
    commentRows.reduce((sum, c) => sum + (c.helpful_count ?? 0), 0) +
    (adjustments[userId] ?? 0);

  const profile: OnboardingData | null = profileRow?.age
    ? {
        consentGiven: profileRow.consent_given,
        photoDataUrl: profileRow.photo_data_url,
        photoProfileDataUrl: profileRow.photo_profile_data_url,
        photoBodyDataUrl: profileRow.photo_body_data_url,
        age: profileRow.age ?? "",
        sex: (profileRow.sex as OnboardingData["sex"]) ?? null,
        heightCm: profileRow.height_cm ?? "",
        weightKg: profileRow.weight_kg ?? "",
        activityLevel: (profileRow.activity_level as OnboardingData["activityLevel"]) ?? null,
        steps: profileRow.steps ?? "",
        goals: (profileRow.goals ?? []) as OnboardingData["goals"],
      }
    : null;

  return {
    id: clerkUser.id,
    displayName: clerkUser.fullName || clerkUser.username || "Sans nom",
    email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: clerkUser.imageUrl,
    createdAt: new Date(clerkUser.createdAt).toISOString(),
    plan: profileRow?.plan === "premium" ? "premium" : "free",
    profile,
    faceShape: (profileRow?.face_shape as FaceShape) ?? null,
    contributionCount,
    points,
    reputationLabel: getReputationTier(points, tiers).label,
  };
}

export async function updateUserPlanAdmin(userId: string, plan: Plan): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = planSchema.safeParse(plan);
  if (!parsed.success) return { ok: false, error: "Plan invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, plan: parsed.data, updated_at: new Date().toISOString() });

  if (error) return { ok: false, error: "Impossible de modifier le plan." };
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserProfileAdmin(userId: string, profile: OnboardingData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = onboardingProfileSchema.safeParse(profile);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Profil invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("user_profiles").upsert({
    user_id: userId,
    consent_given: parsed.data.consentGiven,
    photo_data_url: parsed.data.photoDataUrl,
    photo_profile_data_url: parsed.data.photoProfileDataUrl,
    photo_body_data_url: parsed.data.photoBodyDataUrl,
    age: parsed.data.age,
    sex: parsed.data.sex,
    height_cm: parsed.data.heightCm,
    weight_kg: parsed.data.weightKg,
    activity_level: parsed.data.activityLevel,
    steps: parsed.data.steps,
    goals: parsed.data.goals,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: "Impossible de modifier le profil." };
  revalidatePath("/admin/users");
  return { ok: true };
}
