"use client";

import { useState } from "react";
import { categoryLabels, moderateContent, currentWeeklyTopic, type ArticleCategory } from "@/lib/community";
import { MediaPicker } from "@/components/community/media-picker";
import { LockIcon, SparklesIcon } from "@/components/icons";
import type { NewPostMedia, CommunityStanding } from "@/app/(app)/communaute/actions";

const categories = Object.keys(categoryLabels) as ArticleCategory[];

export function PostComposer({
  standing,
  onSubmit,
}: {
  standing: CommunityStanding;
  onSubmit: (content: string, category: ArticleCategory, media?: NewPostMedia) => Promise<string | null>;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("general");
  const [media, setMedia] = useState<NewPostMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const topic = currentWeeklyTopic();

  async function handleSubmit() {
    const preCheck = moderateContent(content);
    if (preCheck.status === "flagged") {
      setError(preCheck.reason ?? "Message non autorisé.");
      return;
    }
    setSubmitting(true);
    const result = await onSubmit(content, category, media ?? undefined);
    setSubmitting(false);
    if (result) {
      setError(result);
      return;
    }
    setContent("");
    setMedia(null);
    setError(null);
  }

  function useTopic() {
    setCategory(topic.category);
    setContent(topic.question);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <button
        type="button"
        onClick={useTopic}
        className="flex w-full items-start gap-2.5 rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 px-3.5 py-2.5 text-left transition-colors hover:bg-accent-soft/70"
      >
        <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
        <span className="text-xs leading-relaxed text-foreground">
          <span className="font-semibold text-accent-strong">Sujet de la semaine : </span>
          {topic.question}
        </span>
      </button>

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        placeholder="Partagez un conseil, une question, une avancée…"
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />

      {standing.canUploadMedia ? (
        <MediaPicker value={media} onChange={setMedia} />
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border px-3.5 py-2.5 text-xs text-muted">
          <LockIcon className="h-3.5 w-3.5 shrink-0" />
          Photos & vidéos débloquées à {standing.remainingForMedia > 0
            ? `${standing.remainingForMedia} contribution${standing.remainingForMedia > 1 ? "s" : ""} de plus`
            : "bientôt"}{" "}
          (palier {standing.tier.label}).
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ArticleCategory)}
          className="rounded-full border border-border bg-surface-muted px-3 py-2 text-xs font-medium text-foreground focus:border-accent focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="bg-gradient-accent rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Publication…" : "Publier"}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Votre message est vérifié par notre modération avant publication.
      </p>
    </div>
  );
}
