"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingProfileSchema, faceShapeSchema, planSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import type { OnboardingData } from "@/lib/onboarding";
import type { Plan } from "@/lib/user-data";
import type { FaceShape } from "@/lib/hair";

type ProfileRow = {
  plan: string;
  consent_given: boolean;
  photo_data_url: string | null;
  photo_profile_data_url: string | null;
  photo_body_data_url: string | null;
  age: string | null;
  sex: string | null;
  height_cm: string | null;
  weight_kg: string | null;
  activity_level: string | null;
  steps: string | null;
  goals: string[] | null;
  face_shape: string | null;
};

function rowToProfile(row: ProfileRow): OnboardingData {
  return {
    consentGiven: row.consent_given,
    photoDataUrl: row.photo_data_url,
    photoProfileDataUrl: row.photo_profile_data_url,
    photoBodyDataUrl: row.photo_body_data_url,
    age: row.age ?? "",
    sex: (row.sex as OnboardingData["sex"]) ?? null,
    heightCm: row.height_cm ?? "",
    weightKg: row.weight_kg ?? "",
    activityLevel: (row.activity_level as OnboardingData["activityLevel"]) ?? null,
    steps: row.steps ?? "",
    goals: (row.goals ?? []) as OnboardingData["goals"],
  };
}

export type UserData = {
  profile: OnboardingData | null;
  plan: Plan;
  faceShape: FaceShape | null;
};

const EMPTY_USER_DATA: UserData = { profile: null, plan: "free", faceShape: null };

export async function getUserData(): Promise<UserData> {
  const { userId } = await auth();
  if (!userId) return EMPTY_USER_DATA;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("user_profiles")
    .select(
      "plan, consent_given, photo_data_url, photo_profile_data_url, photo_body_data_url, age, sex, height_cm, weight_kg, activity_level, steps, goals, face_shape"
    )
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (!data) return EMPTY_USER_DATA;

  return {
    profile: data.age ? rowToProfile(data) : null,
    plan: data.plan === "premium" ? "premium" : "free",
    faceShape: (data.face_shape as FaceShape) ?? null,
  };
}

export async function saveUserProfile(
  profile: OnboardingData
): Promise<{ ok: true } | { ok: false; reason: "auth" | "rate-limit" | "validation" | "db"; detail?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, reason: "auth" };
  if (!(await checkRateLimit("profileWrite", userId))) return { ok: false, reason: "rate-limit" };

  const parsed = onboardingProfileSchema.safeParse(profile);
  if (!parsed.success) {
    return { ok: false, reason: "validation", detail: parsed.error.issues[0]?.message };
  }

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

  return error ? { ok: false, reason: "db", detail: error.message } : { ok: true };
}

export async function saveUserPlan(plan: Plan): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };
  if (!(await checkRateLimit("profileWrite", userId))) return { ok: false };

  const parsed = planSchema.safeParse(plan);
  if (!parsed.success) return { ok: false };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, plan: parsed.data, updated_at: new Date().toISOString() });

  return { ok: !error };
}

export async function saveFaceShapeData(faceShape: FaceShape): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };
  if (!(await checkRateLimit("profileWrite", userId))) return { ok: false };

  const parsed = faceShapeSchema.safeParse(faceShape);
  if (!parsed.success) return { ok: false };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, face_shape: parsed.data, updated_at: new Date().toISOString() });

  return { ok: !error };
}
