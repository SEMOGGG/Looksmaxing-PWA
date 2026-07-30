"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { ArticleCard } from "@/components/community/article-card";
import { PostCard } from "@/components/community/post-card";
import { PostComposer } from "@/components/community/post-composer";
import { LockIcon, ShieldCheckIcon } from "@/components/icons";
import {
  articles,
  categoryLabels,
  addPost,
  addComment,
  toggleLike,
  loadPosts,
  type ArticleCategory,
  type Post,
} from "@/lib/community";
import { loadPlan, type Plan } from "@/lib/subscription-store";

const categories = Object.keys(categoryLabels) as ArticleCategory[];

export default function CommunautePage() {
  const [tab, setTab] = useState<"articles" | "discussions">("articles");
  const [category, setCategory] = useState<ArticleCategory | "tous">("tous");
  const [posts, setPosts] = useState<Post[]>([]);
  const [plan, setPlan] = useState<Plan>("free");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPosts(loadPosts());
    setPlan(loadPlan());
    setReady(true);
  }, []);

  if (!ready) return null;

  const isPremium = plan === "premium";
  const filteredArticles =
    category === "tous" ? articles : articles.filter((a) => a.category === category);
  const filteredPosts =
    category === "tous" ? posts : posts.filter((p) => p.category === category);

  function handleNewPost(content: string, postCategory: ArticleCategory) {
    setPosts(addPost({ author: "Vous", category: postCategory, content }));
  }

  function handleComment(postId: string, content: string) {
    setPosts(addComment(postId, { author: "Vous", content }));
  }

  function handleLike(postId: string, liked: boolean) {
    setPosts(toggleLike(postId, liked));
  }

  return (
    <>
      <AppTopBar title="Communauté" idPrefix="communaute-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <div className="flex gap-2 rounded-full border border-border bg-surface p-1 text-sm">
          <button
            type="button"
            onClick={() => setTab("articles")}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              tab === "articles" ? "bg-gradient-accent text-white" : "text-muted"
            }`}
          >
            Articles
          </button>
          <button
            type="button"
            onClick={() => setTab("discussions")}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              tab === "discussions" ? "bg-gradient-accent text-white" : "text-muted"
            }`}
          >
            Discussions
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("tous")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              category === "tous"
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border text-muted"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-border text-muted"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {tab === "articles" ? (
          <div className="mt-4 flex flex-col gap-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                Espace bienveillant : on s&rsquo;encourage, on ne juge pas. Les messages sont
                vérifiés par notre modération avant publication ; ce n&rsquo;est pas un
                espace de conseil médical — pour toute question de santé, consultez un
                professionnel.
              </p>
            </div>

            {isPremium ? (
              <PostComposer onSubmit={handleNewPost} />
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                  <LockIcon className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted">
                  Publier et commenter est réservé aux membres{" "}
                  <span className="font-medium text-foreground">Premium</span>.{" "}
                  <Link
                    href="/compte"
                    className="font-medium text-accent-strong underline underline-offset-2"
                  >
                    Débloquer
                  </Link>
                </p>
              </div>
            )}

            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canParticipate={isPremium}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
