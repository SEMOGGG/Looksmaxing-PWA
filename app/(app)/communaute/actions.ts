"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  moderateContent,
  seedPosts,
  getContributionTier,
  MEDIA_UNLOCK_THRESHOLD,
  type ArticleCategory,
  type ContributionTier,
  type Post,
} from "@/lib/community";
import {
  articleCategorySchema,
  postContentSchema,
  commentContentSchema,
  communityMediaSchema,
  moderationFrameSchema,
} from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { moderateMediaImages } from "@/lib/moderation";

const postIdSchema = z.string().uuid();

// Anti double-soumission / anti-rafale : en plus du quota glissant
// (checkRateLimit "communityWrite"), on refuse toute publication trop
// rapprochée de la précédente du même auteur, tous types confondus.
const FLOOD_COOLDOWN_SECONDS = 3;

type ActionResult = { ok: true; posts: Post[] } | { ok: false; error: string };

export type NewPostMedia = {
  dataUrl: string;
  mediaType: "image" | "video";
  // Frames JPEG extraites côté client pour la modération d'une vidéo
  // (Claude ne prend pas la vidéo directement en entrée).
  previewFrames?: string[];
};

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

// Nombre total de publications + commentaires d'un auteur, tous statuts
// confondus. Calculé à la volée plutôt que via un compteur dénormalisé :
// le trafic Communauté reste faible, deux requêtes indexées suffisent.
async function getContributionCount(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  authorId: string
): Promise<number> {
  const [{ count: postCount }, { count: commentCount }] = await Promise.all([
    supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("author_id", authorId),
    supabase.from("community_comments").select("id", { count: "exact", head: true }).eq("author_id", authorId),
  ]);
  return (postCount ?? 0) + (commentCount ?? 0);
}

// Même calcul, mais pour plusieurs auteurs à la fois (un fil de publications
// entier) en 2 requêtes groupées plutôt qu'une paire de requêtes par post —
// c'est ce qui permet d'afficher un badge de palier sur chaque publication
// sans faire exploser le nombre de requêtes.
async function getAuthorTiers(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  authorIds: string[]
): Promise<Record<string, ContributionTier>> {
  const uniqueIds = Array.from(new Set(authorIds));
  if (uniqueIds.length === 0) return {};

  const [{ data: postRows }, { data: commentRows }] = await Promise.all([
    supabase.from("community_posts").select("author_id").in("author_id", uniqueIds),
    supabase.from("community_comments").select("author_id").in("author_id", uniqueIds),
  ]);

  const counts: Record<string, number> = {};
  for (const row of [...(postRows ?? []), ...(commentRows ?? [])]) {
    counts[row.author_id] = (counts[row.author_id] ?? 0) + 1;
  }

  const tiers: Record<string, ContributionTier> = {};
  for (const id of uniqueIds) {
    tiers[id] = getContributionTier(counts[id] ?? 0);
  }
  return tiers;
}

async function checkFloodCooldown(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  authorId: string
): Promise<boolean> {
  const since = new Date(Date.now() - FLOOD_COOLDOWN_SECONDS * 1000).toISOString();
  const [{ data: recentPosts }, { data: recentComments }] = await Promise.all([
    supabase.from("community_posts").select("id").eq("author_id", authorId).gte("created_at", since).limit(1),
    supabase.from("community_comments").select("id").eq("author_id", authorId).gte("created_at", since).limit(1),
  ]);
  return (recentPosts?.length ?? 0) === 0 && (recentComments?.length ?? 0) === 0;
}

export async function getPosts(): Promise<Post[]> {
  const supabase = getSupabaseServerClient();
  await seedIfEmpty(supabase);

  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id, author_id, author_display_name, category, content, media_url, media_type, likes_count, created_at")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (error || !posts) return [];

  const { data: comments } = await supabase
    .from("community_comments")
    .select("id, post_id, author_display_name, content, created_at")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: true });

  const authorTiers = await getAuthorTiers(
    supabase,
    posts.map((post) => post.author_id)
  );

  return posts.map((post) => ({
    id: post.id,
    author: post.author_display_name,
    category: post.category,
    content: post.content,
    createdAt: post.created_at,
    likes: post.likes_count,
    mediaUrl: post.media_url ?? null,
    mediaType: (post.media_type as "image" | "video" | null) ?? null,
    authorTier: authorTiers[post.author_id] ?? getContributionTier(0),
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

export type CommunityStanding = {
  contributionCount: number;
  tier: ContributionTier;
  canUploadMedia: boolean;
  remainingForMedia: number;
};

export async function getCommunityStanding(): Promise<CommunityStanding> {
  const { userId } = await auth();
  if (!userId) {
    return {
      contributionCount: 0,
      tier: getContributionTier(0),
      canUploadMedia: false,
      remainingForMedia: MEDIA_UNLOCK_THRESHOLD,
    };
  }

  const supabase = getSupabaseServerClient();
  const contributionCount = await getContributionCount(supabase, userId);
  return {
    contributionCount,
    tier: getContributionTier(contributionCount),
    canUploadMedia: contributionCount >= MEDIA_UNLOCK_THRESHOLD,
    remainingForMedia: Math.max(0, MEDIA_UNLOCK_THRESHOLD - contributionCount),
  };
}

async function resolveDisplayName(): Promise<string> {
  const user = await currentUser();
  return user?.firstName || user?.username || "Membre";
}

function extensionForMediaType(mimeType: string): string {
  const raw = mimeType.split("/")[1] ?? "bin";
  return raw.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

// Décode un media en data URL (photo ou frame de modération), l'envoie à
// Claude vision pour vérifier qu'il ne contient rien à caractère sexuel,
// violent ou choquant, puis — seulement si tout est sûr — téléverse le
// média original dans le bucket Supabase et renvoie son URL publique.
async function processAndStoreMedia(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  authorId: string,
  media: NewPostMedia
): Promise<{ ok: true; mediaUrl: string; mediaType: "image" | "video" } | { ok: false; error: string }> {
  const parsedMedia = communityMediaSchema.safeParse(media.dataUrl);
  if (!parsedMedia.success) {
    return { ok: false, error: parsedMedia.error.issues[0]?.message ?? "Média invalide." };
  }

  const match = parsedMedia.data.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Média invalide." };
  const [, mimeType, base64Data] = match;

  const imagesToModerate: { base64Data: string; mediaType: string }[] = [];

  if (media.mediaType === "image") {
    imagesToModerate.push({ base64Data, mediaType: mimeType });
  } else {
    const frames = media.previewFrames ?? [];
    if (frames.length === 0) {
      return { ok: false, error: "Impossible d'analyser cette vidéo, réessayez avec un autre fichier." };
    }
    for (const frame of frames.slice(0, 3)) {
      const parsedFrame = moderationFrameSchema.safeParse(frame);
      if (!parsedFrame.success) return { ok: false, error: "Aperçu vidéo invalide." };
      const frameMatch = parsedFrame.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!frameMatch) return { ok: false, error: "Aperçu vidéo invalide." };
      imagesToModerate.push({ base64Data: frameMatch[2], mediaType: frameMatch[1] });
    }
  }

  const moderation = await moderateMediaImages(imagesToModerate);
  if (!moderation.ok) return { ok: false, error: moderation.reason };

  const buffer = Buffer.from(base64Data, "base64");
  const path = `${authorId}/${randomUUID()}.${extensionForMediaType(mimeType)}`;

  const { error: uploadError } = await supabase.storage
    .from("community-media")
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) return { ok: false, error: "Échec de l'envoi du média, réessayez." };

  const { data: publicUrlData } = supabase.storage.from("community-media").getPublicUrl(path);
  return { ok: true, mediaUrl: publicUrlData.publicUrl, mediaType: media.mediaType };
}

export async function createPost(
  content: string,
  category: ArticleCategory,
  media?: NewPostMedia
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour publier dans la communauté." };

  const allowed = await checkRateLimit("communityWrite", userId);
  if (!allowed) return { ok: false, error: "Trop de publications d'un coup, patientez un instant." };

  const parsedContent = postContentSchema.safeParse(content);
  const parsedCategory = articleCategorySchema.safeParse(category);
  if (!parsedContent.success || !parsedCategory.success) {
    return { ok: false, error: "Message invalide." };
  }

  const moderation = moderateContent(parsedContent.data);
  if (moderation.status === "flagged") {
    return { ok: false, error: moderation.reason ?? "Message non autorisé." };
  }

  const supabase = getSupabaseServerClient();

  const withinCooldown = !(await checkFloodCooldown(supabase, userId));
  if (withinCooldown) {
    return { ok: false, error: "Vous publiez trop vite, patientez quelques secondes." };
  }

  let mediaUrl: string | null = null;
  let mediaType: "image" | "video" | null = null;

  if (media) {
    const mediaAllowed = await checkRateLimit("communityMedia", userId);
    if (!mediaAllowed) {
      return { ok: false, error: "Trop de photos/vidéos envoyées récemment, patientez avant de réessayer." };
    }

    const contributionCount = await getContributionCount(supabase, userId);
    if (contributionCount < MEDIA_UNLOCK_THRESHOLD) {
      return {
        ok: false,
        error: `L'envoi de photos et vidéos est réservé aux membres à partir de ${MEDIA_UNLOCK_THRESHOLD} contributions.`,
      };
    }

    const stored = await processAndStoreMedia(supabase, userId, media);
    if (!stored.ok) return { ok: false, error: stored.error };
    mediaUrl = stored.mediaUrl;
    mediaType = stored.mediaType;
  }

  const { error } = await supabase.from("community_posts").insert({
    author_id: userId,
    author_display_name: await resolveDisplayName(),
    category: parsedCategory.data,
    content: parsedContent.data,
    media_url: mediaUrl,
    media_type: mediaType,
    moderation_status: "approved",
  });

  if (error) return { ok: false, error: "Une erreur est survenue, réessayez." };
  return { ok: true, posts: await getPosts() };
}

export async function createComment(postId: string, content: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour commenter." };

  const allowed = await checkRateLimit("communityWrite", userId);
  if (!allowed) return { ok: false, error: "Trop de commentaires d'un coup, patientez un instant." };

  const parsedPostId = postIdSchema.safeParse(postId);
  const parsedContent = commentContentSchema.safeParse(content);
  if (!parsedPostId.success || !parsedContent.success) {
    return { ok: false, error: "Commentaire invalide." };
  }

  const moderation = moderateContent(parsedContent.data);
  if (moderation.status === "flagged") {
    return { ok: false, error: moderation.reason ?? "Message non autorisé." };
  }

  const supabase = getSupabaseServerClient();

  const withinCooldown = !(await checkFloodCooldown(supabase, userId));
  if (withinCooldown) {
    return { ok: false, error: "Vous publiez trop vite, patientez quelques secondes." };
  }

  const { error } = await supabase.from("community_comments").insert({
    post_id: parsedPostId.data,
    author_id: userId,
    author_display_name: await resolveDisplayName(),
    content: parsedContent.data,
    moderation_status: "approved",
  });

  if (error) return { ok: false, error: "Une erreur est survenue, réessayez." };
  return { ok: true, posts: await getPosts() };
}

export async function toggleLike(postId: string, liked: boolean): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour aimer une publication." };

  const parsedPostId = postIdSchema.safeParse(postId);
  if (!parsedPostId.success) return { ok: false, error: "Publication invalide." };

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

  const parsedPostId = postIdSchema.safeParse(postId);
  if (!parsedPostId.success) return { ok: false, error: "Publication invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_reports").insert({
    post_id: parsedPostId.data,
    reporter_id: userId,
  });

  if (error) return { ok: false, error: "Une erreur est survenue." };
  return { ok: true };
}
