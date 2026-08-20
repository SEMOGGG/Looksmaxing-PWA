import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting optionnel : si UPSTASH_REDIS_REST_URL / TOKEN ne sont pas
// configurées, checkRateLimit laisse toujours passer (pas de crash, juste
// pas de protection tant que ce n'est pas branché). Compte gratuit sur
// https://upstash.com — la variable est à ajouter dans .env.local et Vercel.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = {
  // Rafale de messages Coach IA : au-delà des quotas jour/mois déjà en
  // place, empêche un script d'enchaîner les appels API en boucle serrée.
  coachMessage: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s") }) : null,
  // Publications/commentaires Communauté.
  communityWrite: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s") }) : null,
  // Photos/vidéos Communauté : plus coûteux (stockage + modération IA) que
  // le texte, donc plafond nettement plus bas que communityWrite.
  communityMedia: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "600 s") }) : null,
  // Analyses par photo (corps/peau) : le vrai plafond est le budget
  // mensuel partagé (lib/ai-usage.ts), pas ce compteur — ceci absorbe
  // juste une rafale de requêtes rapprochées.
  photoAnalysis: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "3600 s") }) : null,
  // Sauvegarde de profil/plan/forme de visage.
  profileWrite: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "60 s") }) : null,
} as const;

export type RateLimitName = keyof typeof limiters;

export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<boolean> {
  const limiter = limiters[name];
  if (!limiter) return true; // Upstash non configuré : pas de limite appliquée

  const { success } = await limiter.limit(`${name}:${identifier}`);
  return success;
}
