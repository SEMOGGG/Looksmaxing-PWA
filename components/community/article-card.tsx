"use client";

import { useState } from "react";
import { categoryLabels, type Article } from "@/lib/community";

export function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
          {categoryLabels[article.category]}
        </span>
        <h3 className="mt-3 text-base font-semibold text-foreground">{article.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{article.excerpt}</p>
        <span className="mt-3 flex items-center gap-2 text-xs text-muted">
          {article.readMinutes} min de lecture
          <span aria-hidden>{open ? "· Réduire" : "· Lire l'article"}</span>
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm leading-relaxed text-muted">
          {article.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}
