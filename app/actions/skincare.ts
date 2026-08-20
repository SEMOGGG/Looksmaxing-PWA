"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { seedSkincareIngredients, type SkincareIngredient } from "@/lib/skincare";

type IngredientRow = {
  id: string;
  name: string;
  what_it_does: string;
  how_to_use: string;
  caution: string;
  example_product: string;
  niche: boolean;
  needs: string[];
};

function rowToIngredient(row: IngredientRow): SkincareIngredient {
  return {
    id: row.id,
    name: row.name,
    whatItDoes: row.what_it_does,
    howToUse: row.how_to_use,
    caution: row.caution,
    exampleProduct: row.example_product,
    niche: row.niche,
    needs: row.needs,
  };
}

// Injecte la bibliothèque de démonstration une seule fois si la table est
// vide — modifiable ensuite depuis /admin/routine.
async function seedIfEmpty(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const { count } = await supabase
    .from("skincare_ingredients")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) return;

  await supabase.from("skincare_ingredients").insert(
    seedSkincareIngredients.map((ingredient, index) => ({
      id: ingredient.id,
      name: ingredient.name,
      what_it_does: ingredient.whatItDoes,
      how_to_use: ingredient.howToUse,
      caution: ingredient.caution,
      example_product: ingredient.exampleProduct,
      niche: ingredient.niche,
      needs: ingredient.needs,
      sort_order: index,
    }))
  );
}

export async function getSkincareIngredients(): Promise<SkincareIngredient[]> {
  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data } = await supabase
    .from("skincare_ingredients")
    .select("id, name, what_it_does, how_to_use, caution, example_product, niche, needs")
    .order("sort_order", { ascending: true })
    .returns<IngredientRow[]>();

  return (data ?? []).map(rowToIngredient);
}
