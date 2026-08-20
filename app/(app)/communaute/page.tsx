"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { AppTopBar } from "@/components/app-top-bar";
import { ArticleCard } from "@/components/community/article-card";
import { PostCard } from "@/components/community/post-card";
import { PostComposer } from "@/components/community/post-composer";
import { ChadSpotlight, LeaderboardRow } from "@/components/community/reputation-badge";
import { Reveal } from "@/components/reveal";
import { LockIcon, ShieldCheckIcon, UsersIcon, MessageIcon, HeartIcon, TrophyIcon } from "@/components/icons";
import { articles, categoryLabels, CHAD_SLOTS, type ArticleCategory, type Post } from "@/lib/community";
import type { Plan } from "@/lib/user-data";
import { getUserData } from "@/app/actions/user-data";
import {
  getPosts,
  createPost,
  createComment,
  toggleLike,
  toggleCommentVote,
  reportPost,
  getCommunityStanding,
  getLeaderboard,
  type CommunityStanding,
  type NewPostMedia,
} from "./actions";
import type { LeaderboardEntry } from "@/lib/community";

const categories = Object.keys(categoryLabels) as ArticleCategory[];

const DEFAULT_STANDING: CommunityStanding = {
  contributionCount: 0,
  tier: { id: "nouveau", label: "Nouveau", minCount: 0 },
  canUploadMedia: false,
  remainingForMedia: 200,
};

export default function CommunautePage() {
  const { isSignedIn } = useUser();
  const [tab, setTab] = useState<"articles" | "discussions" | "classement">("articles");
  const [category, setCategory] = useState<ArticleCategory | "tous">("tous");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [posts, setPosts] = useState<Post[]>([]);
  const [plan, setPlan] = useState<Plan>("free");
  const [standing, setStanding] = useState<CommunityStanding>(DEFAULT_STANDING);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getPosts(), getCommunityStanding(), getLeaderboard()])
      .then(([userData, loadedPosts, loadedStanding, loadedLeaderboard]) => {
        setPlan(userData.plan);
        setPosts(loadedPosts);
        setStanding(loadedStanding);
        setLeaderboard(loadedLeaderboard);
      })
      .finally(() => setReady(true));
  }, []);

  const stats = useMemo(() => {
    const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    const distinctAuthors = new Set(posts.map((p) => p.author)).size;
    return { totalPosts: posts.length, totalComments, totalLikes, distinctAuthors };
  }, [posts]);

  if (!ready) return null;

  const isPremium = plan === "premium";
  const canParticipate = isPremium && Boolean(isSignedIn);
  const filteredArticles =
    category === "tous" ? articles : articles.filter((a) => a.category === category);
  const filteredPosts = (
    category === "tous" ? posts : posts.filter((p) => p.category === category)
  ).slice();
  if (sort === "popular") filteredPosts.sort((a, b) => b.likes - a.likes);

  async function handleNewPost(content: string, postCategory: ArticleCategory, media?: NewPostMedia) {
    const result = await createPost(content, postCategory, media);
    if (!result.ok) return result.error;
    setPosts(result.posts);
    getCommunityStanding().then(setStanding);
    return null;
  }

  async function handleComment(postId: string, content: string) {
    const result = await createComment(postId, content);
    if (!result.ok) return result.error;
    setPosts(result.posts);
    getCommunityStanding().then(setStanding);
    return null;
  }

  function handleLike(postId: string, liked: boolean) {
    toggleLike(postId, liked).then((result) => {
      if (result.ok) {
        setPosts(result.posts);
        getLeaderboard().then(setLeaderboard);
      }
    });
  }

  function handleCommentVote(commentId: string, voted: boolean) {
    toggleCommentVote(commentId, voted).then((result) => {
      if (result.ok) {
        setPosts(result.posts);
        getLeaderboard().then(setLeaderboard);
      }
    });
  }

  async function handleReport(postId: string) {
    const result = await reportPost(postId);
    return result.ok ? null : result.error;
  }

  return (
    <>
      <AppTopBar
        title="Communauté"
        idPrefix="communaute-logo"
        end={isSignedIn ? <UserButton /> : undefined}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <Reveal>
          <div className="relative -mx-5 h-36 overflow-hidden sm:mx-0 sm:h-48 sm:rounded-3xl">
            {/* Image libre de droits (Picsum), teintée pour coller à la DA sombre/violette du reste de l'app. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/faciem-communaute/1200/500"
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-accent/20 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <p className="font-heading text-lg font-semibold text-white sm:text-xl">
                Progressez ensemble, sans jugement.
              </p>
              <p className="mt-1 text-xs text-white/80 sm:text-sm">
                Conseils, questions, avancées — un espace sérieux et bienveillant.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 flex gap-2 rounded-full border border-border bg-surface p-1 text-sm">
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
          <button
            type="button"
            onClick={() => setTab("classement")}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              tab === "classement" ? "bg-gradient-accent text-white" : "text-muted"
            }`}
          >
            Classement
          </button>
        </div>

        {tab !== "classement" && (
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
        )}

        {tab === "articles" ? (
          <div className="mt-4 flex flex-col gap-3">
            {filteredArticles.map((article, i) => (
              <Reveal key={article.id} delay={Math.min(i, 4) * 60}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        ) : tab === "discussions" ? (
          <div className="mt-4 flex flex-col gap-3">
            <Reveal>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                  <UsersIcon className="h-4 w-4 shrink-0 text-accent-strong" />
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {stats.distinctAuthors}
                    </p>
                    <p className="text-[11px] text-muted">Membres actifs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                  <MessageIcon className="h-4 w-4 shrink-0 text-accent-strong" />
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {stats.totalPosts + stats.totalComments}
                    </p>
                    <p className="text-[11px] text-muted">Messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                  <HeartIcon className="h-4 w-4 shrink-0 text-accent-strong" />
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">{stats.totalLikes}</p>
                    <p className="text-[11px] text-muted">Likes donnés</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
                  <TrophyIcon className="h-4 w-4 shrink-0 text-accent-strong" />
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {standing.contributionCount}
                    </p>
                    <p className="text-[11px] text-muted">Vos contributions</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                Espace bienveillant : on s&rsquo;encourage, on ne juge pas. Les messages sont
                vérifiés par notre modération avant publication, et les photos/vidéos sont
                analysées automatiquement (aucun contenu à caractère sexuel ou choquant) ; ce
                n&rsquo;est pas un espace de conseil médical — pour toute question de santé,
                consultez un professionnel.
              </p>
            </div>

            {isPremium ? (
              isSignedIn ? (
                <PostComposer standing={standing} onSubmit={handleNewPost} />
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                    <LockIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted">
                      Connectez-vous pour publier et commenter dans la communauté.
                    </p>
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="bg-gradient-accent mt-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                      >
                        Se connecter
                      </button>
                    </SignInButton>
                  </div>
                </div>
              )
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

            {filteredPosts.length > 0 && (
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setSort("recent")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    sort === "recent" ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
                  }`}
                >
                  Récents
                </button>
                <button
                  type="button"
                  onClick={() => setSort("popular")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    sort === "popular" ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
                  }`}
                >
                  Populaires
                </button>
              </div>
            )}

            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canParticipate={canParticipate}
                onLike={handleLike}
                onComment={handleComment}
                onCommentVote={handleCommentVote}
                onReport={handleReport}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-muted">
              1 point par like reçu sur une publication, 1 point par vote « astuce utile » reçu sur
              un commentaire. Les {CHAD_SLOTS} meilleurs scores décrochent le badge Chad — les places
              se reprennent si quelqu&rsquo;un d&rsquo;autre passe devant.
            </p>

            {leaderboard.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface p-5 text-sm text-muted">
                Personne n&rsquo;a encore reçu de like ou de vote « utile ». Soyez les premiers à
                lancer le classement !
              </p>
            ) : (
              <>
                {leaderboard[0] && leaderboard[0].badge.kind === "chad" && (
                  <Reveal>
                    <ChadSpotlight entry={leaderboard[0]} />
                  </Reveal>
                )}

                {leaderboard.filter((e) => e.badge.kind === "chad" && e.rank > 1).length > 0 && (
                  <div>
                    <h2 className="mb-2.5 text-sm font-semibold tracking-wide text-muted uppercase">
                      Autres Chads
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {leaderboard
                        .filter((e) => e.badge.kind === "chad" && e.rank > 1)
                        .map((entry) => (
                          <LeaderboardRow key={entry.authorId} entry={entry} highlight />
                        ))}
                    </div>
                  </div>
                )}

                {leaderboard.filter((e) => e.badge.kind !== "chad").length > 0 && (
                  <div>
                    <h2 className="mb-2.5 text-sm font-semibold tracking-wide text-muted uppercase">
                      Classement général
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {leaderboard
                        .filter((e) => e.badge.kind !== "chad")
                        .map((entry) => (
                          <LeaderboardRow key={entry.authorId} entry={entry} />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
