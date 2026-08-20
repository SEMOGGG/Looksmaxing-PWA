// Contenu éditorial pour enrichir le hub Routine : techniques naturelles et
// actifs de niche, présentés en rotation quotidienne (basée sur le jour de
// l'année) pour que la page ne soit jamais statique. Complète la
// bibliothèque d'ingrédients plus classique de lib/skincare.ts.

import type { Goal } from "@/lib/onboarding";
import type { SkincareIngredient } from "@/lib/skincare";

export type RoutineTip = { title: string; description: string };

export const naturalSkinTechniques: RoutineTip[] = [
  {
    title: "Brossage à sec avant la douche",
    description:
      "Quelques minutes de brossage à sec (brosse à poils naturels, mouvements vers le cœur) stimulent la circulation et éliminent les cellules mortes en douceur, avant même le nettoyant.",
  },
  {
    title: "Rinçage à l'eau froide en fin de douche",
    description:
      "30 secondes d'eau froide sur le visage resserrent l'apparence des pores et relancent la microcirculation : le teint paraît plus frais immédiatement après.",
  },
  {
    title: "Compresses de thé vert glacé",
    description:
      "Deux sachets infusés puis refroidis au frigo, posés sur les yeux et les zones rouges : les tanins et l'EGCG apaisent et resserrent en une dizaine de minutes.",
  },
  {
    title: "Masque au miel brut",
    description:
      "Le miel non pasteurisé est antibactérien et humectant naturel : en masque 15 minutes, il calme les peaux à imperfections sans les assécher.",
  },
  {
    title: "Dormir sur une taie en soie ou satin",
    description:
      "Moins de friction que le coton : moins de marques de sommeil, moins d'irritations, et les cheveux cassent moins pendant la nuit.",
  },
  {
    title: "Jeûne cutané, un soir par semaine",
    description:
      "Sauter tous les actifs de temps en temps laisse la barrière cutanée se réguler seule, sans surcharge de produits — utile après une routine chargée.",
  },
  {
    title: "Auto-massage à la glace (ice globes)",
    description:
      "Rouler des globes de glace ou un glaçon enveloppé dans un linge sur le visage pendant 2 minutes le matin réduit les gonflements et resserre visiblement les pores.",
  },
  {
    title: "Brumisation à l'eau florale après le nettoyage",
    description:
      "Eau de bleuet ou de rose vaporisée juste après le nettoyant, avant le sérum : elle apaise et améliore l'absorption des actifs qui suivent.",
  },
];

export type NicheActive = { name: string; description: string };

function dayIndex(length: number) {
  const start = Date.UTC(new Date().getUTCFullYear(), 0, 0);
  const oneDay = 86_400_000;
  const diff = Date.now() - start;
  return Math.floor(diff / oneDay) % length;
}

// Puise directement dans la bibliothèque d'ingrédients skincare (gérée
// depuis /admin/routine) pour éviter toute duplication de contenu — le
// hub Routine passe les ingrédients déjà chargés plutôt que d'en refaire
// une lecture séparée.
export function dailyRoutineTip(ingredients: SkincareIngredient[]) {
  const nicheActives: NicheActive[] = ingredients
    .filter((ingredient) => ingredient.niche)
    .map((ingredient) => ({ name: ingredient.name, description: ingredient.whatItDoes }));

  return {
    technique: naturalSkinTechniques[dayIndex(naturalSkinTechniques.length)],
    active: nicheActives.length > 0 ? nicheActives[dayIndex(nicheActives.length)] : null,
  };
}

// Petites étiquettes affichées sur les cartes du hub Routine en fonction des
// objectifs choisis lors de l'onboarding, pour que la page ne pointe pas
// vers les 3 mêmes sous-pages génériques pour tout le monde.
const goalHighlights: Partial<Record<Goal, { href: string; label: string }>> = {
  amelioration_peau: { href: "/skincare", label: "Vitamine C, niacinamide, gua sha" },
  confiance: { href: "/cheveux-barbe", label: "Une coupe qui vous ressemble" },
  prise_de_masse: { href: "/complements", label: "Créatine, protéine" },
  tonicite: { href: "/complements", label: "Oméga-3, magnésium" },
  posture: { href: "/skincare", label: "Routine du soir anti-fatigue" },
  perte_de_gras: { href: "/complements", label: "Repères compléments" },
};

export function routineHighlights(goals: Goal[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const goal of goals) {
    const h = goalHighlights[goal];
    if (h && !map[h.href]) map[h.href] = h.label;
  }
  return map;
}
