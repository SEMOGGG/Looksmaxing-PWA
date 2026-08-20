"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { adminArticleSchema } from "@/lib/validation";
import { seedArticlesIfEmpty } from "@/app/(app)/communaute/actions";
import type { Article } from "@/lib/community";

type ActionResult = { ok: true } | { ok: false; error: string };
export type AdminArticleInput = {
  category: Article["category"];
  title: string;
  excerpt: string;
  content: string[];
  readMinutes: number;
};

export async function listArticlesAdmin(): Promise<Article[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

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

export async function createArticle(input: AdminArticleInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = adminArticleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Article invalide." };

  const supabase = getSupabaseServerClient();
  const { count } = await supabase.from("community_articles").select("id", { count: "exact", head: true });

  const { error } = await supabase.from("community_articles").insert({
    category: parsed.data.category,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    read_minutes: parsed.data.readMinutes,
    sort_order: count ?? 0,
  });

  if (error) return { ok: false, error: "Impossible de créer l'article." };
  revalidatePath("/communaute");
  revalidatePath("/admin/articles");
  return { ok: true };
}

export async function updateArticle(id: string, input: AdminArticleInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const parsed = adminArticleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Article invalide." };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("community_articles")
    .update({
      category: parsed.data.category,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      read_minutes: parsed.data.readMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Impossible de modifier l'article." };
  revalidatePath("/communaute");
  revalidatePath("/admin/articles");
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("community_articles").delete().eq("id", id);

  if (error) return { ok: false, error: "Impossible de supprimer l'article." };
  revalidatePath("/communaute");
  revalidatePath("/admin/articles");
  return { ok: true };
}
