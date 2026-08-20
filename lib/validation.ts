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
// membres à 200 contributions ou plus, voir MEDIA_UNLOCK_THRESHOLD).
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
