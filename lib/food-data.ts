// Recherche de valeurs nutritionnelles réelles via l'API publique et
// gratuite USDA FoodData Central (base de données du gouvernement
// américain), utilisée comme outil par le Coach IA plutôt que de laisser
// le modèle répondre de mémoire sur la composition d'un aliment.
//
// USDA_API_KEY est optionnelle : à défaut, "DEMO_KEY" fonctionne mais est
// limitée à un faible nombre de requêtes par heure et par IP. Une clé
// gratuite personnelle s'obtient sur https://fdc.nal.usda.gov/api-key-signup.

const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

const KEY_NUTRIENTS = [
  "Energy",
  "Protein",
  "Total lipid (fat)",
  "Carbohydrate, by difference",
  "Fiber, total dietary",
  "Sugars, total including NLEA",
  "Sodium, Na",
  "Potassium, K",
  "Calcium, Ca",
  "Iron, Fe",
  "Vitamin C, total ascorbic acid",
];

type UsdaNutrient = { nutrientName: string; value: number; unitName: string };
type UsdaFood = { description: string; foodNutrients?: UsdaNutrient[] };
type UsdaSearchResponse = { foods?: UsdaFood[] };

export async function lookupFoodNutrition(query: string): Promise<string> {
  const apiKey = process.env.USDA_API_KEY || "DEMO_KEY";
  const url = `${USDA_SEARCH_URL}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(
    query
  )}&pageSize=1&dataType=Foundation,SR%20Legacy`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return `Recherche indisponible pour "${query}" (problème réseau).`;
  }

  if (!response.ok) {
    return `Recherche impossible pour "${query}" (erreur ${response.status} de la base USDA).`;
  }

  const data = (await response.json()) as UsdaSearchResponse;
  const food = data.foods?.[0];
  if (!food) return `Aucun résultat trouvé pour "${query}" dans la base USDA FoodData Central.`;

  const nutrients = (food.foodNutrients ?? [])
    .filter((n) => KEY_NUTRIENTS.includes(n.nutrientName))
    .map((n) => `${n.nutrientName}: ${n.value} ${n.unitName}`)
    .join(", ");

  return `${food.description} (pour 100 g, source USDA FoodData Central) : ${
    nutrients || "détail des nutriments indisponible pour cet aliment"
  }.`;
}
