"use client";

import { useEffect, useState } from "react";
import { listArticlesAdmin, createArticle, updateArticle, deleteArticle, type AdminArticleInput } from "../actions/articles";
import { categoryLabels, type Article, type ArticleCategory } from "@/lib/community";

const categories = Object.keys(categoryLabels) as ArticleCategory[];

const emptyForm: AdminArticleInput = {
  category: "general",
  title: "",
  excerpt: "",
  content: [""],
  readMinutes: 4,
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminArticleInput>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function load() {
    listArticlesAdmin().then(setArticles);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(article: Article) {
    setEditingId(article.id);
    setCreating(false);
    setForm({
      category: article.category,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      readMinutes: article.readMinutes,
    });
    setError(null);
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const cleanedContent = form.content.map((p) => p.trim()).filter(Boolean);
    const input = { ...form, content: cleanedContent };
    const result = editingId ? await updateArticle(editingId, input) : await createArticle(input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    cancel();
    load();
  }

  async function handleDelete(id: string) {
    await deleteArticle(id);
    setConfirmingId(null);
    load();
  }

  const isEditing = creating || editingId !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Articles</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={startCreate}
            className="bg-gradient-accent rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            + Nouvel article
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">Contenu éditorial de l&rsquo;onglet Articles de la Communauté.</p>

      {isEditing && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">
            {editingId ? "Modifier l'article" : "Nouvel article"}
          </h2>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.category === cat
                    ? "border-accent bg-accent-soft text-accent-strong"
                    : "border-border text-muted hover:border-accent/40"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-xs text-muted">
            Titre
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Résumé (affiché dans la liste)
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Minutes de lecture
            <input
              type="number"
              min={1}
              max={60}
              value={form.readMinutes}
              onChange={(e) => setForm((f) => ({ ...f, readMinutes: Number(e.target.value) || 1 }))}
              className="mt-1 w-24 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <div className="mt-3">
            <p className="text-xs text-muted">Paragraphes du corps de l&rsquo;article</p>
            {form.content.map((paragraph, i) => (
              <div key={i} className="mt-1.5 flex gap-2">
                <textarea
                  value={paragraph}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      content: f.content.map((p, idx) => (idx === i ? e.target.value : p)),
                    }))
                  }
                  rows={3}
                  className="flex-1 resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
                />
                {form.content.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, content: f.content.filter((_, idx) => idx !== i) }))}
                    className="shrink-0 self-start rounded-full border border-border px-2 py-1 text-xs text-muted hover:text-danger"
                  >
                    Retirer
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, content: [...f.content, ""] }))}
              className="mt-1.5 text-xs font-medium text-accent-strong underline underline-offset-2"
            >
              + Ajouter un paragraphe
            </button>
          </div>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving || !form.title.trim() || !form.excerpt.trim()}
              onClick={handleSave}
              className="bg-gradient-accent rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {articles.map((article) => (
          <div key={article.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-strong uppercase">
                  {categoryLabels[article.category]}
                </span>
                <p className="mt-1.5 text-sm font-semibold text-foreground">{article.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {article.excerpt} · {article.readMinutes} min
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(article)}
                  className="text-xs font-medium text-accent-strong underline underline-offset-2"
                >
                  Modifier
                </button>
                {confirmingId === article.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="rounded-full bg-danger px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-xs text-muted"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(article.id)}
                    className="text-xs font-medium text-muted hover:text-danger"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
