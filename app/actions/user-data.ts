"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/lib/onboarding";
import type { Plan } from "@/lib/user-data";
import type { FaceShape } from "@/lib/hair";

type ProfileRow = {
  plan: string;
  consent_given: boolean;
  photo_data_url: string | null;
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
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (!data) return EMPTY_USER_DATA;

  return {
    profile: data.age ? rowToProfile(data) : null,
    plan: data.plan === "premium" ? "premium" : "free",
    faceShape: (data.face_shape as FaceShape) ?? null,
  };
}

export async function saveUserProfile(profile: OnboardingData): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("user_profiles").upsert({
    user_id: userId,
    consent_given: profile.consentGiven,
    photo_data_url: profile.photoDataUrl,
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    activity_level: profile.activityLevel,
    steps: profile.steps,
    goals: profile.goals,
    updated_at: new Date().toISOString(),
  });

  return { ok: !error };
}

export async function saveUserPlan(plan: Plan): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, plan, updated_at: new Date().toISOString() });

  return { ok: !error };
}

export async function saveFaceShapeData(faceShape: FaceShape): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: userId, face_shape: faceShape, updated_at: new Date().toISOString() });

  return { ok: !error };
}
