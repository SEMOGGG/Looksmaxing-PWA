"use client";

import { useState } from "react";
import { categoryLabels, moderateContent, type Post } from "@/lib/community";
import { formatRelativeTime } from "@/lib/format-time";
import { FlagIcon, HeartIcon, MessageIcon } from "@/components/icons";

export function PostCard({
  post,
  canParticipate,
  onLike,
  onComment,
}: {
  post: Post;
  canParticipate: boolean;
  onLike: (postId: string, liked: boolean) => void;
  onComment: (postId: string, content: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  function handleLike() {
    const next = !liked;
    setLiked(next);
    onLike(post.id, next);
  }

  function handleSubmitComment() {
    const result = moderateContent(draft);
    if (result.status === "flagged") {
      setError(result.reason ?? "Message non autorisé.");
      return;
    }
    onComment(post.id, draft);
    setDraft("");
    setError(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong">
            {post.author.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{post.author}</p>
            <p className="text-xs text-muted">
              {formatRelativeTime(post.createdAt)} · {categoryLabels[post.category]}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setReported(true)}
          disabled={reported}
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-danger disabled:text-accent-strong"
        >
          <FlagIcon className="h-3.5 w-3.5" />
          {reported ? "Signalé" : "Signaler"}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">{post.content}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted">
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? "text-accent-strong" : "hover:text-foreground"}`}
        >
          <HeartIcon className="h-4 w-4" />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <MessageIcon className="h-4 w-4" />
          {post.comments.length}
        </button>
      </div>

      {commentsOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-muted">
                {comment.author.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {comment.author}{" "}
                  <span className="font-normal text-muted">
                    · {formatRelativeTime(comment.createdAt)}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted">{comment.content}</p>
              </div>
            </div>
          ))}
          {post.comments.length === 0 && (
            <p className="text-xs text-muted">Aucun commentaire pour l&rsquo;instant.</p>
          )}

          {canParticipate ? (
            <div className="mt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setError(null);
                  }}
                  placeholder="Votre réponse, avec bienveillance…"
                  className="flex-1 rounded-full border border-border bg-surface-muted px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={!draft.trim()}
                  className="bg-gradient-accent rounded-full px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Envoyer
                </button>
              </div>
              {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted">
              Passez au plan Premium pour répondre à cette discussion.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
