"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { recipeSchema, recipeStatusSchema, recipeImageUrlSchema, photoDataUrlSchema } from "@/lib/validation";
import { seedIfEmpty } from "@/app/actions/recipes";

const idSchema = z.string().uuid();
type ActionResult = { ok: true } | { ok: false; error: string };

// Photo de recette envoyée depuis /admin/recipes : contenu admin, donc pas
// de modération IA (contrairement aux médias Communauté envoyés par les
// membres) — juste un contrôle de format/taille avant l'upload.
export async function uploadRecipeImage(
  dataUrl: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = photoDataUrlSchema.safeParse(dataUrl);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Image invalide." };

  const match = parsed.data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Image invalide." };
  const [, mimeType, base64Data] = match;
  const extension = (mimeType.split("/")[1] ?? "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";

  const supabase = getSupabaseServerClient();
  const buffer = Buffer.from(base64Data, "base64");
  const path = `recipes/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("community-media")
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) return { ok: false, error: "Échec de l'envoi de l'image, réessayez." };

  const { data: publicUrlData } = supabase.storage.from("community-media").getPublicUrl(path);
  return { ok: true, url: publicUrlData.publicUrl };
}

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
  imageUrl: string | null;
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
  imageUrl: string | null;
};

export async function listRecipesAdmin(): Promise<AdminRecipe[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data } = await supabase
    .from("recipes")
    .select(
      "id, title, description, tags, prep_minutes, servings, calories, protein_g, carbs_g, ingredients, steps, tip, image_url, status, submitted_by_name, created_at"
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
    imageUrl: row.image_url,
    status: row.status,
    submittedByName: row.submitted_by_name,
    createdAt: row.created_at,
  }));
}

export async function createRecipe(input: AdminRecipeInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = recipeSchema.safeParse(input);
  const parsedImage = recipeImageUrlSchema.safeParse(input.imageUrl);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Recette invalide." };
  if (!parsedImage.success) return { ok: false, error: "URL d'image invalide." };

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
    image_url: parsedImage.data,
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
  const parsedImage = recipeImageUrlSchema.safeParse(input.imageUrl);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Recette invalide." };
  if (!parsedImage.success) return { ok: false, error: "URL d'image invalide." };

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
      image_url: parsedImage.data,
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
