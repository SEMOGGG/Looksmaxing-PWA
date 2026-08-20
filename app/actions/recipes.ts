"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { seedRecipes, type Recipe } from "@/lib/recipes";
import { recipeSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

type RecipeRow = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prep_minutes: number;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  ingredients: string[];
  steps: string[];
  tip: string | null;
};

function rowToRecipe(row: RecipeRow): Recipe {
  return {
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
  };
}

// Injecte le livre de recettes de démonstration une seule fois si la table
// est vide — modifiable ensuite depuis /admin/recipes. Exportée pour que
// /admin/recipes puisse aussi déclencher ce remplissage : sans ça, un admin
// qui visite le panel avant que quiconque n'ait ouvert /nutrition/recettes
// verrait un livre vide alors que la migration SQL s'est bien passée.
export async function seedIfEmpty(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const { count } = await supabase.from("recipes").select("id", { count: "exact", head: true });
  if (count && count > 0) return;

  await supabase.from("recipes").insert(
    seedRecipes.map((recipe, index) => ({
      title: recipe.title,
      description: recipe.description,
      tags: recipe.tags,
      prep_minutes: recipe.prepMinutes,
      servings: recipe.servings,
      calories: recipe.calories,
      protein_g: recipe.proteinG,
      carbs_g: recipe.carbsG,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tip: recipe.tip,
      status: "approved",
      sort_order: index,
    }))
  );
}

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data } = await supabase
    .from("recipes")
    .select("id, title, description, tags, prep_minutes, servings, calories, protein_g, carbs_g, ingredients, steps, tip")
    .eq("status", "approved")
    .order("sort_order", { ascending: true })
    .returns<RecipeRow[]>();

  return (data ?? []).map(rowToRecipe);
}

export type MyRecipeSubmission = { id: string; title: string; status: string; createdAt: string };

// Statut des propositions de l'utilisateur connecté, pour qu'il puisse
// suivre si elles ont été approuvées sans avoir à redemander en support.
export async function getMyRecipeSubmissions(): Promise<MyRecipeSubmission[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("recipes")
    .select("id, title, status, created_at")
    .eq("submitted_by", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export type RecipeSubmissionInput = {
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

type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitRecipe(input: RecipeSubmissionInput): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour proposer une recette." };

  const allowed = await checkRateLimit("recipeSubmit", userId);
  if (!allowed) return { ok: false, error: "Trop de recettes proposées récemment, réessayez demain." };

  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Recette invalide." };

  const user = await currentUser();
  const displayName = user?.firstName || user?.username || "Membre";

  const supabase = getSupabaseServerClient();
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
    status: "pending",
    submitted_by: userId,
    submitted_by_name: displayName,
  });

  if (error) return { ok: false, error: "Une erreur est survenue, réessayez." };
  return { ok: true };
}
