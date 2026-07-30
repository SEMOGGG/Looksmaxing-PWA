import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client Supabase côté serveur uniquement (clé secrète = accès complet,
// bypass RLS). Ne jamais importer ce fichier depuis un composant client
// ni l'exposer via une variable NEXT_PUBLIC_*.
//
// Initialisation paresseuse : tant que SUPABASE_URL / SUPABASE_SECRET_KEY
// ne sont pas configurées (Vercel + .env.local), les pages qui n'appellent
// pas cette fonction continuent de fonctionner normalement.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase n'est pas configuré : SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définies (voir .env.local et les variables d'environnement Vercel)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
