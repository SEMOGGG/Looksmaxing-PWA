"use client";

import { useState } from "react";
import { categoryLabels, moderateContent, type ArticleCategory } from "@/lib/community";

const categories = Object.keys(categoryLabels) as ArticleCategory[];

export function PostComposer({
  onSubmit,
}: {
  onSubmit: (content: string, category: ArticleCategory) => void;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("general");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const result = moderateContent(content);
    if (result.status === "flagged") {
      setError(result.reason ?? "Message non autorisé.");
      return;
    }
    onSubmit(content, category);
    setContent("");
    setError(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        placeholder="Partagez un conseil, une question, une avancée…"
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
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
          disabled={!content.trim()}
          className="bg-gradient-accent rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publier
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Votre message est vérifié par notre modération avant publication.
      </p>
    </div>
  );
}
