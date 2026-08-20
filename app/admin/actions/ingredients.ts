"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { adminIngredientSchema } from "@/lib/validation";
import type { SkincareIngredient } from "@/lib/skincare";

type ActionResult = { ok: true } | { ok: false; error: string };
export type AdminIngredientInput = {
  id: string;
  name: string;
  whatItDoes: string;
  howToUse: string;
  caution: string;
  exampleProduct: string;
  niche: boolean;
  needs: string[];
};

export async function listIngredientsAdmin(): Promise<SkincareIngredient[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("skincare_ingredients")
    .select("id, name, what_it_does, how_to_use, caution, example_product, niche, needs")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    whatItDoes: row.what_it_does,
    howToUse: row.how_to_use,
    caution: row.caution,
    exampleProduct: row.example_product,
    niche: row.niche,
    needs: row.needs,
  }));
}

export async function createIngredient(input: AdminIngredientInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = adminIngredientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Produit invalide." };

  const supabase = getSupabaseServerClient();
  const { count } = await supabase.from("skincare_ingredients").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("skincare_ingredients").insert({
    id: parsed.data.id,
    name: parsed.data.name,
    what_it_does: parsed.data.whatItDoes,
    how_to_use: parsed.data.howToUse,
    caution: parsed.data.caution,
    example_product: parsed.data.exampleProduct,
    niche: parsed.data.niche,
    needs: parsed.data.needs,
    sort_order: count ?? 0,
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Cet identifiant existe déjà." : "Impossible de créer le produit.",
    };
  }
  revalidatePath("/skincare");
  revalidatePath("/routine");
  revalidatePath("/admin/routine");
  return { ok: true };
}

// L'id (slug) ne se modifie pas après création : il sert d'ancre #id sur
// /skincare, un changement casserait tout lien déjà partagé vers ce produit.
export async function updateIngredient(id: string, input: AdminIngredientInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = adminIngredientSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Produit invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("skincare_ingredients")
    .update({
      name: parsed.data.name,
      what_it_does: parsed.data.whatItDoes,
      how_to_use: parsed.data.howToUse,
      caution: parsed.data.caution,
      example_product: parsed.data.exampleProduct,
      niche: parsed.data.niche,
      needs: parsed.data.needs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Impossible de modifier le produit." };
  revalidatePath("/skincare");
  revalidatePath("/routine");
  revalidatePath("/admin/routine");
  return { ok: true };
}

export async function deleteIngredient(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("skincare_ingredients").delete().eq("id", id);

  if (error) return { ok: false, error: "Impossible de supprimer le produit." };
  revalidatePath("/skincare");
  revalidatePath("/routine");
  revalidatePath("/admin/routine");
  return { ok: true };
}
