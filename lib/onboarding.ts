// Données et types partagés par le flux d'onboarding.
// Les niveaux d'activité reprennent les multiplicateurs Mifflin-St Jeor
// standards, réutilisés plus tard par la page nutrition pour le calcul du
// TDEE.

export type Sex = "femme" | "homme" | "non_precise";

export type ActivityLevel =
  | "sedentaire"
  | "leger"
  | "modere"
  | "actif"
  | "tres_actif";

export type Goal =
  | "perte_de_gras"
  | "prise_de_masse"
  | "amelioration_peau"
  | "tonicite"
  | "posture"
  | "confiance";

export type OnboardingData = {
  consentGiven: boolean;
  photoDataUrl: string | null;
  age: string;
  sex: Sex | null;
  heightCm: string;
  weightKg: string;
  activityLevel: ActivityLevel | null;
  steps: string;
  goals: Goal[];
};

export const initialOnboardingData: OnboardingData = {
  consentGiven: false,
  photoDataUrl: null,
  age: "",
  sex: null,
  heightCm: "",
  weightKg: "",
  activityLevel: null,
  steps: "",
  goals: [],
};

export const sexOptions: { value: Sex; label: string }[] = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "non_precise", label: "Je préfère ne pas préciser" },
];

export const activityLevels: {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}[] = [
  {
    value: "sedentaire",
    label: "Sédentaire",
    description: "Peu ou pas d'exercice, travail plutôt assis",
    multiplier: 1.2,
  },
  {
    value: "leger",
    label: "Légèrement actif",
    description: "Exercice léger 1 à 3 jours par semaine",
    multiplier: 1.375,
  },
  {
    value: "modere",
    label: "Modérément actif",
    description: "Exercice modéré 3 à 5 jours par semaine",
    multiplier: 1.55,
  },
  {
    value: "actif",
    label: "Actif",
    description: "Exercice intense 6 à 7 jours par semaine",
    multiplier: 1.725,
  },
  {
    value: "tres_actif",
    label: "Très actif",
    description: "Sport intense quotidien ou métier physique",
    multiplier: 1.9,
  },
];

export const goalOptions: { value: Goal; label: string; description: string }[] = [
  {
    value: "perte_de_gras",
    label: "Perte de gras",
    description: "Affiner votre silhouette progressivement",
  },
  {
    value: "prise_de_masse",
    label: "Prise de masse musculaire",
    description: "Gagner en volume et en force",
  },
  {
    value: "amelioration_peau",
    label: "Amélioration de la peau",
    description: "Teint, boutons, hydratation",
  },
  {
    value: "tonicite",
    label: "Plus de tonicité",
    description: "Un corps plus ferme au quotidien",
  },
  {
    value: "posture",
    label: "Meilleure posture",
    description: "Se tenir plus droit, plus naturellement",
  },
  {
    value: "confiance",
    label: "Plus de confiance en soi",
    description: "Se sentir bien face au miroir",
  },
];
