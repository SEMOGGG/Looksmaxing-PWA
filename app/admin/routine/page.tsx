"use client";

import { useEffect, useState } from "react";
import {
  listIngredientsAdmin,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type AdminIngredientInput,
} from "../actions/ingredients";
import { skincareNeeds, type SkincareIngredient } from "@/lib/skincare";

const emptyForm: AdminIngredientInput = {
  id: "",
  name: "",
  whatItDoes: "",
  howToUse: "",
  caution: "",
  exampleProduct: "",
  niche: false,
  needs: [],
};

const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminRoutinePage() {
  const [ingredients, setIngredients] = useState<SkincareIngredient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminIngredientInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function load() {
    listIngredientsAdmin().then(setIngredients);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(ingredient: SkincareIngredient) {
    setEditingId(ingredient.id);
    setCreating(false);
    setForm({ ...ingredient });
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

  function toggleNeed(needId: string) {
    setForm((f) => ({
      ...f,
      needs: f.needs.includes(needId) ? f.needs.filter((n) => n !== needId) : [...f.needs, needId],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input = { ...form, id: creating ? slugify(form.id) : form.id };
    const result = editingId ? await updateIngredient(editingId, input) : await createIngredient(input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    cancel();
    load();
  }

  async function handleDelete(id: string) {
    await deleteIngredient(id);
    setConfirmingId(null);
    load();
  }

  const isEditing = creating || editingId !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Bibliothèque skincare</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={startCreate}
            className="bg-gradient-accent rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            + Nouveau produit
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {ingredients.length} produits, affichés sur /skincare et dans les astuces du hub Routine.
      </p>

      {isEditing && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">
            {editingId ? "Modifier le produit" : "Nouveau produit"}
          </h2>

          {creating && (
            <label className="mt-3 block text-xs text-muted">
              Identifiant (généré depuis le nom si laissé vide)
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                placeholder={form.name ? slugify(form.name) : "ex. niacinamide"}
                className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </label>
          )}

          <label className="mt-3 block text-xs text-muted">
            Nom
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value, id: creating && !f.id ? "" : f.id }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Ce que ça fait
            <textarea
              value={form.whatItDoes}
              onChange={(e) => setForm((f) => ({ ...f, whatItDoes: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Usage
            <textarea
              value={form.howToUse}
              onChange={(e) => setForm((f) => ({ ...f, howToUse: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Précaution
            <textarea
              value={form.caution}
              onChange={(e) => setForm((f) => ({ ...f, caution: e.target.value }))}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 block text-xs text-muted">
            Exemple de produit accessible
            <input
              type="text"
              value={form.exampleProduct}
              onChange={(e) => setForm((f) => ({ ...f, exampleProduct: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.niche}
              onChange={(e) => setForm((f) => ({ ...f, niche: e.target.checked }))}
              className="h-4 w-4 accent-accent"
            />
            Actif de niche (badge « Niche » affiché)
          </label>

          <div className="mt-3">
            <p className="text-xs text-muted">Répond aux besoins</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {skincareNeeds.map((need) => (
                <button
                  key={need.id}
                  type="button"
                  onClick={() => toggleNeed(need.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.needs.includes(need.id)
                      ? "border-accent bg-accent-soft text-accent-strong"
                      : "border-border text-muted hover:border-accent/40"
                  }`}
                >
                  {need.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-danger">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={saving || !form.name.trim()}
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
        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{ingredient.name}</p>
                  {ingredient.niche && (
                    <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-accent-strong uppercase">
                      Niche
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted">{ingredient.whatItDoes}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(ingredient)}
                  className="text-xs font-medium text-accent-strong underline underline-offset-2"
                >
                  Modifier
                </button>
                {confirmingId === ingredient.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(ingredient.id)}
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
                    onClick={() => setConfirmingId(ingredient.id)}
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
