"use server";

import { randomUUID } from "crypto";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  moderateContent,
  seedPosts,
  seedArticles,
  getContributionTier,
  getReputationTier,
  computeLeaderboardBadge,
  type Article,
  type ArticleCategory,
  type ContributionTier,
  type LeaderboardBadge,
  type LeaderboardEntry,
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
import { getReputationTiersDb, getCommunitySettings, getPointAdjustmentTotals } from "@/lib/community-data.server";

const postIdSchema = z.string().uuid();
const commentIdSchema = z.string().uuid();

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

// Classement complet de la Communauté par points de réputation : 1 point
// par like reçu sur une publication + 1 point par vote "utile" reçu sur un
// commentaire. "seed" (publications éditoriales de démonstration) est
// exclu — ce n'est pas un vrai membre et fausserait l'agrégation, plusieurs
// posts de démo partageant ce même author_id.
async function computeLeaderboard(
  supabase: ReturnType<typeof getSupabaseServerClient>
): Promise<LeaderboardEntry[]> {
  const [{ data: postRows }, { data: commentRows }, adjustments, tiers, settings] = await Promise.all([
    supabase.from("community_posts").select("author_id, author_display_name, likes_count").neq("author_id", "seed"),
    supabase
      .from("community_comments")
      .select("author_id, author_display_name, helpful_count")
      .neq("author_id", "seed"),
    getPointAdjustmentTotals(supabase),
    getReputationTiersDb(supabase),
    getCommunitySettings(supabase),
  ]);

  const points: Record<string, number> = {};
  const names: Record<string, string> = {};
  for (const row of postRows ?? []) {
    points[row.author_id] = (points[row.author_id] ?? 0) + (row.likes_count ?? 0);
    names[row.author_id] = row.author_display_name;
  }
  for (const row of commentRows ?? []) {
    points[row.author_id] = (points[row.author_id] ?? 0) + (row.helpful_count ?? 0);
    names[row.author_id] = row.author_display_name;
  }
  for (const [userId, bonus] of Object.entries(adjustments)) {
    points[userId] = (points[userId] ?? 0) + bonus;
    names[userId] ??= "Membre";
  }

  return Object.entries(points)
    .map(([authorId, pts]) => ({ authorId, displayName: names[authorId] ?? "Membre", points: pts }))
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      badge: computeLeaderboardBadge(entry.points, index + 1, tiers, settings.chadSlots, settings.chadMinPoints),
    }));
}

function badgeMapFromLeaderboard(leaderboard: LeaderboardEntry[]): Record<string, LeaderboardBadge> {
  const map: Record<string, LeaderboardBadge> = {};
  for (const entry of leaderboard) map[entry.authorId] = entry.badge;
  return map;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseServerClient();
  return computeLeaderboard(supabase);
}

// Réglages publics (nombre de places Chad, etc.), pour l'affichage — les
// vraies valeurs viennent de /admin/badges plutôt que d'être codées en dur.
export async function getCommunitySettingsPublic() {
  const supabase = getSupabaseServerClient();
  return getCommunitySettings(supabase);
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
    .select("id, post_id, author_id, author_display_name, content, helpful_count, created_at")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: true });

  const leaderboard = await computeLeaderboard(supabase);
  const badges = badgeMapFromLeaderboard(leaderboard);
  // Repli pour les auteurs absents du classement (ex. "seed", les
  // publications éditoriales de démonstration, volontairement exclues du
  // calcul des points).
  const zeroPointsBadge: LeaderboardBadge = { kind: "tier", tier: getReputationTier(0) };

  return posts.map((post) => ({
    id: post.id,
    author: post.author_display_name,
    category: post.category,
    content: post.content,
    createdAt: post.created_at,
    likes: post.likes_count,
    mediaUrl: post.media_url ?? null,
    mediaType: (post.media_type as "image" | "video" | null) ?? null,
    authorBadge: badges[post.author_id] ?? zeroPointsBadge,
    comments: (comments ?? [])
      .filter((comment) => comment.post_id === post.id)
      .map((comment) => ({
        id: comment.id,
        author: comment.author_display_name,
        content: comment.content,
        createdAt: comment.created_at,
        helpfulCount: comment.helpful_count ?? 0,
        authorBadge: badges[comment.author_id] ?? zeroPointsBadge,
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
  const supabase = getSupabaseServerClient();
  const { mediaUnlockThreshold } = await getCommunitySettings(supabase);

  const { userId } = await auth();
  if (!userId) {
    return {
      contributionCount: 0,
      tier: getContributionTier(0),
      canUploadMedia: false,
      remainingForMedia: mediaUnlockThreshold,
    };
  }

  const contributionCount = await getContributionCount(supabase, userId);
  return {
    contributionCount,
    tier: getContributionTier(contributionCount),
    canUploadMedia: contributionCount >= mediaUnlockThreshold,
    remainingForMedia: Math.max(0, mediaUnlockThreshold - contributionCount),
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

    const [contributionCount, { mediaUnlockThreshold }] = await Promise.all([
      getContributionCount(supabase, userId),
      getCommunitySettings(supabase),
    ]);
    if (contributionCount < mediaUnlockThreshold) {
      return {
        ok: false,
        error: `L'envoi de photos et vidéos est réservé aux membres à partir de ${mediaUnlockThreshold} contributions.`,
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
    // Les likes valent des points de réputation (badges Chad/HTN/...) : on
    // empêche de s'auto-liker pour ne pas fausser le classement.
    const { data: post } = await supabase
      .from("community_posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();
    if (post?.author_id === userId) {
      return { ok: false, error: "Vous ne pouvez pas aimer votre propre publication." };
    }

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

export async function toggleCommentVote(commentId: string, voted: boolean): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Connectez-vous pour noter une réponse." };

  const parsedCommentId = commentIdSchema.safeParse(commentId);
  if (!parsedCommentId.success) return { ok: false, error: "Commentaire invalide." };

  const supabase = getSupabaseServerClient();

  if (voted) {
    const { data: comment } = await supabase
      .from("community_comments")
      .select("author_id")
      .eq("id", commentId)
      .maybeSingle();
    if (comment?.author_id === userId) {
      return { ok: false, error: "Vous ne pouvez pas noter votre propre réponse." };
    }

    const { error } = await supabase
      .from("community_comment_votes")
      .insert({ comment_id: commentId, author_id: userId });
    if (error && error.code !== "23505") {
      return { ok: false, error: "Une erreur est survenue." };
    }
  } else {
    await supabase
      .from("community_comment_votes")
      .delete()
      .eq("comment_id", commentId)
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

// Injecte les articles de démonstration une seule fois si la table est
// vide (même principe que seedIfEmpty pour les publications) — modifiables
// ensuite depuis /admin/articles, sans plus jamais toucher au code source.
async function seedArticlesIfEmpty(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const { count } = await supabase
    .from("community_articles")
    .select("id", { count: "exact", head: true });

  if (count && count > 0) return;

  await supabase.from("community_articles").insert(
    seedArticles.map((article, index) => ({
      category: article.category,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      read_minutes: article.readMinutes,
      sort_order: index,
    }))
  );
}

export async function getArticles(): Promise<Article[]> {
  const supabase = getSupabaseServerClient();
  await seedArticlesIfEmpty(supabase);

  const { data } = await supabase
    .from("community_articles")
    .select("id, category, title, excerpt, content, read_minutes")
    .order("sort_order", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    readMinutes: row.read_minutes,
  }));
}
