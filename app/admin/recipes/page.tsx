"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listRecipesAdmin,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  setRecipeStatus,
  type AdminRecipe,
  type AdminRecipeInput,
} from "../actions/recipes";
import { recipeTags } from "@/lib/recipes";
import { formatRelativeTime } from "@/lib/format-time";

const emptyForm: AdminRecipeInput = {
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
  tip: "",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "bg-accent-soft text-accent-strong"
      : status === "rejected"
        ? "bg-danger/20 text-danger"
        : "bg-surface-muted text-muted";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${color}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminRecipeInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function load() {
    listRecipesAdmin().then(setRecipes);
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = useMemo(() => recipes.filter((r) => r.status === "pending").length, [recipes]);
  const visibleRecipes = useMemo(() => recipes.filter((r) => r.status === tab), [recipes, tab]);

  function startEdit(recipe: AdminRecipe) {
    setEditingId(recipe.id);
    setCreating(false);
    setForm({
      title: recipe.title,
      description: recipe.description,
      tags: recipe.tags,
      prepMinutes: recipe.prepMinutes,
      servings: recipe.servings,
      calories: recipe.calories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tip: recipe.tip ?? "",
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

  function toggleTag(tagId: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter((t) => t !== tagId) : [...f.tags, tagId],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input = {
      ...form,
      ingredients: form.ingredients.map((i) => i.trim()).filter(Boolean),
      steps: form.steps.map((s) => s.trim()).filter(Boolean),
      tip: form.tip?.trim() ? form.tip.trim() : null,
    };
    const result = editingId ? await updateRecipe(editingId, input) : await createRecipe(input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    cancel();
    load();
  }

  async function handleStatus(id: string, status: "approved" | "rejected" | "pending") {
    await setRecipeStatus(id, status);
    load();
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setConfirmingId(null);
    load();
  }

  const isEditing = creating || editingId !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Livre de recettes</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={startCreate}
            className="bg-gradient-accent rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            + Nouvelle recette
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        Recettes affichées sur /nutrition/recettes, y compris celles proposées par les membres.
      </p>

      {isEditing && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">
            {editingId ? "Modifier la recette" : "Nouvelle recette"}
          </h2>

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
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ingredients: f.ingredients.map((v, idx) => (idx === i ? e.target.value : v)),
                    }))
                  }
                  className="flex-1 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, steps: f.steps.map((v, idx) => (idx === i ? e.target.value : v)) }))
                  }
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
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

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving || !form.title.trim() || !form.description.trim()}
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

      <div className="mt-4 flex gap-2 rounded-full border border-border bg-surface p-1 text-sm">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 font-medium transition-colors ${
              tab === t ? "bg-gradient-accent text-white" : "text-muted"
            }`}
          >
            {t === "pending" ? `En attente (${pendingCount})` : t === "approved" ? "Approuvées" : "Rejetées"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {visibleRecipes.length === 0 && <p className="text-sm text-muted">Aucune recette dans cette liste.</p>}
        {visibleRecipes.map((recipe) => (
          <div key={recipe.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{recipe.title}</p>
                  <StatusBadge status={recipe.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted">{recipe.description}</p>
                <p className="mt-1 text-xs text-muted">
                  {recipe.calories} kcal · {recipe.proteinG} g prot. · {recipe.carbsG} g gluc. ·{" "}
                  {formatRelativeTime(recipe.createdAt)}
                  {recipe.submittedByName ? ` · proposée par ${recipe.submittedByName}` : " · éditoriale"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {recipe.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatus(recipe.id, "approved")}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent/40"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(recipe.id, "rejected")}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent/40"
                    >
                      Rejeter
                    </button>
                  </>
                )}
                {recipe.status === "rejected" && (
                  <button
                    type="button"
                    onClick={() => handleStatus(recipe.id, "approved")}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent/40"
                  >
                    Approuver
                  </button>
                )}
                {recipe.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleStatus(recipe.id, "rejected")}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-accent/40"
                  >
                    Dépublier
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(recipe)}
                  className="text-xs font-medium text-accent-strong underline underline-offset-2"
                >
                  Modifier
                </button>
                {confirmingId === recipe.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(recipe.id)}
                      className="rounded-full bg-danger px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Confirmer
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} className="text-xs text-muted">
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(recipe.id)}
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
