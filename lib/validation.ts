// Schémas de validation partagés, appliqués côté serveur dans les Server
// Actions (jamais uniquement côté client : un appel direct à une Server
// Action contourne entièrement les contraintes de l'UI et du typage
// TypeScript, qui n'existent qu'à la compilation).
import { z } from "zod";

const MAX_PHOTO_BYTES = 6 * 1024 * 1024; // ~6 Mo décodé

export const photoDataUrlSchema = z
  .string()
  .regex(/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/, "Format de photo invalide")
  .refine((value) => {
    const base64 = value.slice(value.indexOf(",") + 1);
    const approxBytes = (base64.length * 3) / 4;
    return approxBytes <= MAX_PHOTO_BYTES;
  }, "Photo trop volumineuse (6 Mo maximum)");

export const onboardingProfileSchema = z.object({
  consentGiven: z.boolean(),
  photoDataUrl: photoDataUrlSchema.nullable(),
  photoProfileDataUrl: photoDataUrlSchema.nullable(),
  photoBodyDataUrl: photoDataUrlSchema.nullable(),
  age: z.string().regex(/^\d{0,3}$/, "Âge invalide"),
  sex: z.enum(["femme", "homme", "non_precise"]).nullable(),
  heightCm: z.string().regex(/^\d{0,3}$/, "Taille invalide"),
  weightKg: z.string().regex(/^\d{0,3}(\.\d{1,2})?$/, "Poids invalide"),
  activityLevel: z.enum(["sedentaire", "leger", "modere", "actif", "tres_actif"]).nullable(),
  steps: z.string().regex(/^\d{0,6}$/, "Nombre de pas invalide"),
  goals: z
    .array(
      z.enum(["perte_de_gras", "prise_de_masse", "amelioration_peau", "tonicite", "posture", "confiance"])
    )
    .max(6),
});

export const articleCategorySchema = z.enum(["apparence", "nutrition", "cardio", "style", "general"]);

export const postContentSchema = z.string().trim().min(1).max(2000);
export const commentContentSchema = z.string().trim().min(1).max(1000);

const MAX_MEDIA_BYTES = 16 * 1024 * 1024; // 16 Mo décodés (photo ou vidéo)

// Photo ou courte vidéo jointe à une publication Communauté (réservé aux
// membres au-dessus d'un seuil de contributions réglable depuis
// /admin/badges, voir app_settings "media_unlock_threshold").
export const communityMediaSchema = z
  .string()
  .regex(
    /^data:(image\/(png|jpe?g|webp|gif)|video\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/]+=*$/,
    "Format de média invalide"
  )
  .refine((value) => {
    const base64 = value.slice(value.indexOf(",") + 1);
    const approxBytes = (base64.length * 3) / 4;
    return approxBytes <= MAX_MEDIA_BYTES;
  }, "Fichier trop volumineux (16 Mo maximum)");

// Image fixe extraite côté client d'une vidéo (jusqu'à 3 frames), envoyée en
// plus de la vidéo pour que la modération IA (image uniquement) puisse
// l'analyser.
export const moderationFrameSchema = z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/, "Aperçu invalide");

export const weightKgSchema = z.number().positive().max(400);

export const coachMessageSchema = z.string().trim().min(1).max(2000);

export const faceShapeSchema = z.enum(["ovale", "rond", "carre", "rectangle", "coeur", "triangle"]);

export const planSchema = z.enum(["free", "premium"]);

// --- Back-office admin (app/admin) ---------------------------------------

export const adminArticleSchema = z.object({
  category: articleCategorySchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(400),
  content: z.array(z.string().trim().min(1).max(3000)).min(1).max(20),
  readMinutes: z.number().int().min(1).max(60),
});

// Slug lisible utilisé comme id (ex. "niacinamide") : cohérent avec les
// ancres #id de la page /skincare.
export const skincareSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Identifiant invalide (minuscules, chiffres et tirets uniquement)")
  .min(2)
  .max(60);

export const adminIngredientSchema = z.object({
  id: skincareSlugSchema,
  name: z.string().trim().min(1).max(120),
  whatItDoes: z.string().trim().min(1).max(600),
  howToUse: z.string().trim().min(1).max(400),
  caution: z.string().trim().min(1).max(400),
  exampleProduct: z.string().trim().max(150),
  niche: z.boolean(),
  needs: z.array(z.string().trim().min(1)).max(10),
});

export const reputationTierSchema = z.object({
  id: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Identifiant invalide")
    .min(2)
    .max(30),
  label: z.string().trim().min(1).max(40),
  minPoints: z.number().int().min(0).max(1_000_000),
});

export const appSettingKeySchema = z.enum(["chad_slots", "chad_min_points", "media_unlock_threshold"]);
export const appSettingValueSchema = z.number().int().min(0).max(1_000_000);

export const pointAdjustmentSchema = z.object({
  userId: z.string().trim().min(1).max(100),
  points: z.number().int().min(-10_000).max(10_000).refine((n) => n !== 0, "Le nombre de points ne peut pas être 0."),
  reason: z.string().trim().min(3).max(300),
});

export const moderationStatusSchema = z.enum(["approved", "pending", "flagged", "removed"]);

// Recettes du livre de recettes (/nutrition/recettes) : proposées par un
// admin (statut "approved" direct) ou par un membre (statut "pending", en
// attente de validation depuis /admin/recipes), voir app/actions/recipes.ts.
export const recipeStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const recipeSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(300),
  tags: z.array(z.string().trim().min(1).max(30)).max(8),
  prepMinutes: z.number().int().min(1).max(240),
  servings: z.number().int().min(1).max(20),
  calories: z.number().int().min(0).max(5000),
  proteinG: z.number().int().min(0).max(500),
  carbsG: z.number().int().min(0).max(500),
  ingredients: z.array(z.string().trim().min(1).max(200)).min(1).max(30),
  steps: z.array(z.string().trim().min(1).max(500)).min(1).max(20),
  tip: z.string().trim().max(400).nullable(),
});
