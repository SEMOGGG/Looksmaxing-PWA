"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { moderationStatusSchema } from "@/lib/validation";
import { z } from "zod";

type ActionResult = { ok: true } | { ok: false; error: string };
const idSchema = z.string().uuid();

export type AdminPost = {
  id: string;
  authorId: string;
  author: string;
  category: string;
  content: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  likes: number;
  moderationStatus: string;
  createdAt: string;
};

export type AdminComment = {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  content: string;
  helpfulCount: number;
  moderationStatus: string;
  createdAt: string;
};

export type AdminReport = {
  id: string;
  postId: string | null;
  commentId: string | null;
  reporterId: string;
  reason: string | null;
  resolved: boolean;
  createdAt: string;
  // Contenu signalé, pour donner le contexte sans avoir à cliquer ailleurs.
  postContent: string | null;
  postAuthor: string | null;
};

export async function listPostsAdmin(): Promise<AdminPost[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("community_posts")
    .select("id, author_id, author_display_name, category, content, media_url, media_type, likes_count, moderation_status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorId: row.author_id,
    author: row.author_display_name,
    category: row.category,
    content: row.content,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    likes: row.likes_count,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
  }));
}

export async function listCommentsAdmin(): Promise<AdminComment[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("community_comments")
    .select("id, post_id, author_id, author_display_name, content, helpful_count, moderation_status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    author: row.author_display_name,
    content: row.content,
    helpfulCount: row.helpful_count ?? 0,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
  }));
}

export async function listReportsAdmin(): Promise<AdminReport[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const supabase = getSupabaseServerClient();
  const { data: reports } = await supabase
    .from("community_reports")
    .select("id, post_id, comment_id, reporter_id, reason, resolved, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const postIds = Array.from(new Set((reports ?? []).map((r) => r.post_id).filter((id): id is string => Boolean(id))));
  const { data: posts } =
    postIds.length > 0
      ? await supabase.from("community_posts").select("id, content, author_display_name").in("id", postIds)
      : { data: [] };
  const postsById = new Map((posts ?? []).map((p) => [p.id, p]));

  return (reports ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    commentId: row.comment_id,
    reporterId: row.reporter_id,
    reason: row.reason,
    resolved: row.resolved,
    createdAt: row.created_at,
    postContent: row.post_id ? (postsById.get(row.post_id)?.content ?? null) : null,
    postAuthor: row.post_id ? (postsById.get(row.post_id)?.author_display_name ?? null) : null,
  }));
}

export async function setPostModerationStatus(postId: string, status: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(postId);
  const parsedStatus = moderationStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, error: "Requête invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("community_posts")
    .update({ moderation_status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/communaute");
  revalidatePath("/admin/community");
  return { ok: true };
}

export async function setCommentModerationStatus(commentId: string, status: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(commentId);
  const parsedStatus = moderationStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { ok: false, error: "Requête invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("community_comments")
    .update({ moderation_status: parsedStatus.data })
    .eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/communaute");
  revalidatePath("/admin/community");
  return { ok: true };
}

export async function deletePostAdmin(postId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(postId);
  if (!parsedId.success) return { ok: false, error: "Publication invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_posts").delete().eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/communaute");
  revalidatePath("/admin/community");
  return { ok: true };
}

export async function deleteCommentAdmin(commentId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(commentId);
  if (!parsedId.success) return { ok: false, error: "Commentaire invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_comments").delete().eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/communaute");
  revalidatePath("/admin/community");
  return { ok: true };
}

export async function resolveReportAdmin(reportId: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsedId = idSchema.safeParse(reportId);
  if (!parsedId.success) return { ok: false, error: "Signalement invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_reports").update({ resolved: true }).eq("id", parsedId.data);

  if (error) return { ok: false, error: "Une erreur est survenue." };
  revalidatePath("/admin/community");
  return { ok: true };
}
