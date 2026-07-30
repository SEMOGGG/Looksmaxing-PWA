"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { moderateContent, seedPosts, type ArticleCategory, type Post } from "@/lib/community";

type ActionResult = { ok: true; posts: Post[] } | { ok: false; error: string };

// Insère les publications de démonstration une seule fois, si la table est
// encore vide — évite d'avoir à faire tourner un script de seed séparé
// contre la base de production.
async function seedIfEmpty(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const { count } = await supabase
    .from("community_posts")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) return;

  for (const seed of seedPosts) {
    const { data: postRow, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: "seed",
        author_display_name: seed.author,
        category: seed.category,
        content: seed.content,
        moderation_status: "approved",
        likes_count: seed.likes,
        created_at: seed.createdAt,
      })
      .select("id")
      .single();

    if (error || !postRow) continue;

    for (const comment of seed.comments) {
      await supabase.from("community_comments").insert({
        post_id: postRow.id,
        author_id: "seed",
        author_display_name: comment.author,
        content: comment.content,
        moderation_status: "approved",
        created_at: comment.createdAt,
      });
    }
  }
}

export async function getPosts(): Promise<Post[]> {
  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, author_display_name, category, content, likes_count, created_at")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (error || !posts) return [];

  const { data: comments } = await supabase
    .from("community_comments")
    .select("id, post_id, author_display_name, content, created_at")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: true });

  return posts.map((post) => ({
    id: post.id,
    author: post.author_display_name,
    category: post.category,
    content: post.content,
    createdAt: post.created_at,
    likes: post.likes_count,
    comments: (comments ?? [])
      .filter((comment) => comment.post_id === post.id)
      .map((comment) => ({
        id: comment.id,
        author: comment.author_display_name,
        content: comment.content,
        createdAt: comment.created_at,
      })),
  }));
}

async function resolveDisplayName(): Promise<string> {
  const user = await currentUser();
  return user?.firstName || user?.username || "Membre";
}

export async function createPost(content: string, category: ArticleCategory): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour publier dans la communauté." };

  const moderation = moderateContent(content);
  if (moderation.status === "flagged") {
    return { ok: false, error: moderation.reason ?? "Message non autorisé." };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_posts").insert({
    author_id: userId,
    author_display_name: await resolveDisplayName(),
    category,
    content,
    moderation_status: "approved",
  });

  if (error) return { ok: false, error: "Une erreur est survenue, réessayez." };
  return { ok: true, posts: await getPosts() };
}

export async function createComment(postId: string, content: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour commenter." };

  const moderation = moderateContent(content);
  if (moderation.status === "flagged") {
    return { ok: false, error: moderation.reason ?? "Message non autorisé." };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_comments").insert({
    post_id: postId,
    author_id: userId,
    author_display_name: await resolveDisplayName(),
    content,
    moderation_status: "approved",
  });

  if (error) return { ok: false, error: "Une erreur est survenue, réessayez." };
  return { ok: true, posts: await getPosts() };
}

export async function toggleLike(postId: string, liked: boolean): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour aimer une publication." };

  const supabase = getSupabaseServerClient();
  if (liked) {
    const { error } = await supabase
      .from("community_likes")
      .insert({ post_id: postId, author_id: userId });
    // Ignore la violation de contrainte d'unicité si déjà aimé (idempotent).
    if (error && error.code !== "23505") {
      return { ok: false, error: "Une erreur est survenue." };
    }
  } else {
    await supabase
      .from("community_likes")
      .delete()
      .eq("post_id", postId)
      .eq("author_id", userId);
  }
  return { ok: true, posts: await getPosts() };
}

export async function reportPost(
  postId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour signaler un contenu." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_reports").insert({
    post_id: postId,
    reporter_id: userId,
  });

  if (error) return { ok: false, error: "Une erreur est survenue." };
  return { ok: true };
}
