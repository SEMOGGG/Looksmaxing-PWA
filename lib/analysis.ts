import type { Goal } from "@/lib/onboarding";

// Données mock : aucune analyse d'image réelle n'est effectuée dans ce MVP.
// Les catégories liées aux objectifs choisis à l'onboarding sont présentées
// comme axes de progression (cohérent avec ce que la personne veut travailler),
// les autres comme points forts déjà acquis — jamais présenté comme un défaut.
type CategoryInfo = {
  key: string;
  label: string;
  goalKeys: Goal[];
  strengthText: string;
  focusText: string;
};

const CATEGORIES: CategoryInfo[] = [
  {
    key: "visage",
    label: "Visage & symétrie",
    goalKeys: ["confiance"],
    strengthText: "Des traits équilibrés qui ressortent naturellement bien en photo.",
    focusText:
      "Quelques ajustements simples (soin, expressions, posture du visage) peuvent encore affiner l'équilibre général.",
  },
  {
    key: "peau",
    label: "Peau",
    goalKeys: ["amelioration_peau"],
    strengthText: "Un grain de peau régulier, une bonne base à entretenir.",
    focusText: "Une routine ciblée peut nettement améliorer le teint et la texture.",
  },
  {
    key: "posture",
    label: "Posture",
    goalKeys: ["posture"],
    strengthText: "Un maintien naturellement droit qui valorise votre silhouette.",
    focusText: "Travailler le gainage et le placement des épaules peut transformer votre allure.",
  },
  {
    key: "tonus",
    label: "Tonus musculaire",
    goalKeys: ["prise_de_masse", "tonicite"],
    strengthText: "Une base musculaire déjà bien présente.",
    focusText: "Un peu plus de volume musculaire changerait sensiblement les proportions.",
  },
  {
    key: "composition",
    label: "Composition corporelle",
    goalKeys: ["perte_de_gras"],
    strengthText: "Une composition corporelle déjà équilibrée.",
    focusText: "Une perte de gras progressive ferait ressortir votre morphologie.",
  },
];

export type AnalysisCategory = {
  key: string;
  label: string;
  score: number;
  isFocus: boolean;
  summary: string;
};

export type AnalysisResult = {
  overallScore: number;
  categories: AnalysisCategory[];
};

export function generateAnalysis(goals: Goal[]): AnalysisResult {
  const categories: AnalysisCategory[] = CATEGORIES.map((category, index) => {
    const isFocus = category.goalKeys.some((goal) => goals.includes(goal));
    const score = isFocus ? 58 + ((index * 5) % 12) : 80 + ((index * 4) % 13);
    return {
      key: category.key,
      label: category.label,
      score,
      isFocus,
      summary: isFocus ? category.focusText : category.strengthText,
    };
  });

  const overallScore = Math.round(
    categories.reduce((sum, category) => sum + category.score, 0) / categories.length
  );

  return { overallScore, categories };
}
