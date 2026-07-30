import { activityLevels, type OnboardingData } from "@/lib/onboarding";

// Formule de Mifflin-St Jeor : la référence la plus fiable pour estimer le
// métabolisme de base (BMR) à partir de l'âge, du sexe, de la taille et du
// poids.
export function calculateBMR(profile: OnboardingData): number {
  const weight = parseFloat(profile.weightKg) || 70;
  const height = parseFloat(profile.heightCm) || 175;
  const age = parseFloat(profile.age) || 25;
  const base = 10 * weight + 6.25 * height - 5 * age;

  if (profile.sex === "homme") return base + 5;
  if (profile.sex === "femme") return base - 161;
  return base - 78; // moyenne neutre quand le sexe n'est pas précisé
}

export function calculateTDEE(profile: OnboardingData): number {
  const bmr = calculateBMR(profile);
  const multiplier =
    activityLevels.find((level) => level.value === profile.activityLevel)
      ?.multiplier ?? 1.2;
  return bmr * multiplier;
}

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  proteinPerKg: number;
  carbsG: number;
  fatG: number;
  adjustment: "deficit" | "surplus" | "maintien";
};

// Apport protéique par kg de poids de corps : un minimum de 1,8 g/kg, monté
// jusqu'à 2,0-2,2 g/kg pour les niveaux d'activité les plus élevés.
const PROTEIN_PER_KG: Record<NonNullable<OnboardingData["activityLevel"]>, number> = {
  sedentaire: 1.8,
  leger: 1.8,
  modere: 1.9,
  actif: 2.0,
  tres_actif: 2.2,
};

export function calculateTargets(profile: OnboardingData): NutritionTargets {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);

  let calories = tdee;
  let adjustment: NutritionTargets["adjustment"] = "maintien";
  if (profile.goals.includes("perte_de_gras")) {
    calories = tdee - 400;
    adjustment = "deficit";
  } else if (profile.goals.includes("prise_de_masse")) {
    calories = tdee + 300;
    adjustment = "surplus";
  }

  const weight = parseFloat(profile.weightKg) || 70;
  const proteinPerKg = profile.activityLevel ? PROTEIN_PER_KG[profile.activityLevel] : 1.8;
  const proteinG = Math.round(weight * proteinPerKg);
  const proteinCal = proteinG * 4;
  const fatCal = calories * 0.27;
  const fatG = Math.round(fatCal / 9);
  const carbsCal = Math.max(calories - proteinCal - fatCal, 0);
  const carbsG = Math.round(carbsCal / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories / 10) * 10,
    proteinG,
    proteinPerKg,
    fatG,
    carbsG,
    adjustment,
  };
}
