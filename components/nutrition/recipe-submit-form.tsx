"use client";

import { useState } from "react";
import { recipeTags } from "@/lib/recipes";
import { submitRecipe, type RecipeSubmissionInput } from "@/app/actions/recipes";

const emptyForm: RecipeSubmissionInput = {
  title: "",
  description: "",
  tags: [],
  prepMinutes: 15,
  servings: 1,
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  ingredients: [""],
  steps: [""],
  tip: null,
};

export function RecipeSubmitForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [form, setForm] = useState<RecipeSubmissionInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleTag(tagId: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((t) => t !== tagId) : [...f.tags, tagId],
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const input: RecipeSubmissionInput = {
      ...form,
      ingredients: form.ingredients.map((i) => i.trim()).filter(Boolean),
      steps: form.steps.map((s) => s.trim()).filter(Boolean),
      tip: form.tip?.trim() ? form.tip.trim() : null,
    };
    const result = await submitRecipe(input);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(emptyForm);
    setSuccess(true);
    onSubmitted?.();
  }

  const canSubmit =
    form.title.trim() &&
    form.description.trim() &&
    form.ingredients.some((i) => i.trim()) &&
    form.steps.some((s) => s.trim());

  if (success) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent-soft/40 p-5 text-center">
        <p className="text-sm font-medium text-foreground">Recette envoyée !</p>
        <p className="mt-1 text-sm text-muted">
          Elle est en attente de validation par un admin avant d&rsquo;apparaître dans le livre de recettes.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-3 text-xs font-medium text-accent-strong underline underline-offset-2"
        >
          Proposer une autre recette
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <label className="block text-xs text-muted">
        Titre de la recette
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="mt-3 block text-xs text-muted">
        Description courte
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <div className="mt-3">
        <p className="text-xs text-muted">Étiquettes</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {recipeTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                form.tags.includes(tag.id)
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-border text-muted hover:border-accent/40"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <label className="block text-xs text-muted">
          Minutes
          <input
            type="number"
            min={1}
            max={240}
            value={form.prepMinutes}
            onChange={(e) => setForm((f) => ({ ...f, prepMinutes: Number(e.target.value) || 1 }))}
            className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs text-muted">
          Portions
          <input
            type="number"
            min={1}
            max={20}
            value={form.servings}
            onChange={(e) => setForm((f) => ({ ...f, servings: Number(e.target.value) || 1 }))}
            className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs text-muted">
          Kcal / portion
          <input
            type="number"
            min={0}
            max={5000}
            value={form.calories}
            onChange={(e) => setForm((f) => ({ ...f, calories: Number(e.target.value) || 0 }))}
            className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs text-muted">
          Protéines (g)
          <input
            type="number"
            min={0}
            max={500}
            value={form.proteinG}
            onChange={(e) => setForm((f) => ({ ...f, proteinG: Number(e.target.value) || 0 }))}
            className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs text-muted">
          Glucides (g)
          <input
            type="number"
            min={0}
            max={500}
            value={form.carbsG}
            onChange={(e) => setForm((f) => ({ ...f, carbsG: Number(e.target.value) || 0 }))}
            className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted">Ingrédients</p>
        {form.ingredients.map((line, i) => (
          <div key={i} className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={line}
              placeholder="ex. 150 g de blanc de poulet"
              onChange={(e) =>
                setForm((f) => ({ ...f, ingredients: f.ingredients.map((v, idx) => (idx === i ? e.target.value : v)) }))
              }
              className="flex-1 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {form.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }))}
                className="shrink-0 rounded-full border border-border px-2 py-1 text-xs text-muted hover:text-danger"
              >
                Retirer
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, ingredients: [...f.ingredients, ""] }))}
          className="mt-1.5 text-xs font-medium text-accent-strong underline underline-offset-2"
        >
          + Ajouter un ingrédient
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted">Étapes de préparation</p>
        {form.steps.map((line, i) => (
          <div key={i} className="mt-1.5 flex gap-2">
            <textarea
              value={line}
              placeholder="ex. Faites dorer le poulet à la poêle 8-10 minutes."
              onChange={(e) => setForm((f) => ({ ...f, steps: f.steps.map((v, idx) => (idx === i ? e.target.value : v)) }))}
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            {form.steps.length > 1 && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }))}
                className="shrink-0 self-start rounded-full border border-border px-2 py-1 text-xs text-muted hover:text-danger"
              >
                Retirer
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, ""] }))}
          className="mt-1.5 text-xs font-medium text-accent-strong underline underline-offset-2"
        >
          + Ajouter une étape
        </button>
      </div>

      <label className="mt-3 block text-xs text-muted">
        Astuce (facultatif)
        <textarea
          value={form.tip ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, tip: e.target.value }))}
          rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
        className="bg-gradient-accent mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Envoi…" : "Envoyer pour validation"}
      </button>
      <p className="mt-3 text-xs text-muted">
        Votre recette est vérifiée par un admin avant d&rsquo;apparaître dans le livre de recettes.
      </p>
    </div>
  );
}
