"use server";

import { isAdmin } from "@/lib/admin";

// Simple booléen exposé au client pour afficher (ou non) le lien vers
// /admin sur la page Compte — aucune donnée sensible renvoyée, la vraie
// vérification d'accès reste côté serveur dans lib/admin.ts (layout +
// chaque Server Action admin).
export async function checkIsAdmin(): Promise<boolean> {
  return isAdmin();
}
