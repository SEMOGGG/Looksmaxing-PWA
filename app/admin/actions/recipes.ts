"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { recipeSchema, recipeStatusSchema } from "@/lib/validation";
import { seedIfEmpty } from "@/app/actions/recipes";

const idSchema = z.string().uuid();
type ActionResult = { ok: true } | { ok: false; error: string };

export type AdminRecipe = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prepMinutes: number;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  ingredients: string[];
  steps: string[];
  tip: string | null;
  status: string;
  submittedByName: string | null;
  createdAt: string;
};

export type AdminRecipeInput = {
  title: string;
  description: string;
  tags: string[];
  prepMinutes: number;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  ingredients: string[];
  steps: string[];
  tip: string | null;
};

export async function listRecipesAdmin(): Promise<AdminRecipe[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data } = await supabase
    .from("recipes")
    .select(
      "id, title, description, tags, prep_minutes, servings, calories, protein_g, carbs_g, ingredients, steps, tip, status, submitted_by_name, created_at"
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    tags: row.tags,
    prepMinutes: row.prep_minutes,
    servings: row.servings,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    ingredients: row.ingredients,
    steps: row.steps,
    tip: row.tip,
    status: row.status,
    submittedByName: row.submitted_by_name,
    createdAt: row.created_at,
  }));
}

export async function createRecipe(input: AdminRecipeInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Recette invalide." };

  const supabase = getSupabaseServerClient();
  const { count } = await supabase.from("recipes").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("recipes").insert({
    title: parsed.data.title,
    description: parsed.data.description,
    tags: parsed.data.tags,
    prep_minutes: parsed.data.prepMinutes,
    servings: parsed.data.servings,
    calories: parsed.data.calories,
    protein_g: parsed.data.proteinG,
    carbs_g: parsed.data.carbsG,
    ingredients: parsed.data.ingredients,
    steps: parsed.data.steps,
    tip: parsed.data.tip,
    status: "approved",
    sort_order: count ?? 0,
  });

  if (error) return { ok: false, error: "Impossible de créer la recette." };
  revalidatePath("/nutrition/recettes");
  revalidatePath("/admin/recipes");
  return { ok: true };
}

export async function updateRecipe(id: string, input: AdminRecipeInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Recette invalide." };

  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Recette invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("recipes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags,
      prep_minutes: parsed.data.prepMinutes,
      servings: parsed.data.servings,
      calories: parsed.data.calories,
      protein_g: parsed.data.proteinG,
      carbs_g: parsed.data.carbsG,
      ingredients: parsed.data.ingredients,
      steps: parsed.data.steps,
      tip: parsed.data.tip,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsedId.data);

  if (error) return { ok: false, error: "Impossible de modifier la recette." };
  revalidatePath("/nutrition/recettes");
  revalidatePath("/admin/recipes");
  return { ok: true };
}

export async function setRecipeStatus(id: string, status: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(id);
  const parsedStatus = recipeStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, error: "Requête invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("recipes").update({ status: parsedStatus.data }).eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/nutrition/recettes");
  revalidatePath("/admin/recipes");
  return { ok: true };
}

export async function deleteRecipe(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: "Recette invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("recipes").delete().eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/nutrition/recettes");
  revalidatePath("/admin/recipes");
  return { ok: true };
}
