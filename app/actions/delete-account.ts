"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Suppression complète du compte (RGPD, droit à l'effacement) : toutes les
// tables où l'identifiant Clerk apparaît, puis le compte Clerk lui-même.
// Note : supprimer ses propres publications communauté supprime aussi (en
// cascade, côté base) les commentaires que d'autres membres y ont laissés —
// un compromis assumé pour ce MVP plutôt qu'une anonymisation partielle.
export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Non connecté." };

  const supabase = getSupabaseServerClient();

  const deletions = await Promise.all([
    supabase.from("community_posts").delete().eq("author_id", userId),
    supabase.from("community_comments").delete().eq("author_id", userId),
    supabase.from("community_likes").delete().eq("author_id", userId),
    supabase.from("community_reports").delete().eq("reporter_id", userId),
    supabase.from("coach_messages").delete().eq("user_id", userId),
    supabase.from("weight_entries").delete().eq("user_id", userId),
    supabase.from("body_analyses").delete().eq("user_id", userId),
    supabase.from("skin_analyses").delete().eq("user_id", userId),
    supabase.from("user_profiles").delete().eq("user_id", userId),
  ]);

  if (deletions.some((result) => result.error)) {
    return { ok: false, error: "Une partie de vos données n'a pas pu être supprimée, réessayez." };
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    return {
      ok: false,
      error: "Vos données ont été supprimées mais la suppression du compte a échoué, contactez le support.",
    };
  }

  return { ok: true };
}
