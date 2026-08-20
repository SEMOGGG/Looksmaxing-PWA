"use client";

import { useState } from "react";
import { recipeTags, type Recipe } from "@/lib/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const tagLabels = recipe.tags.map((id) => recipeTags.find((t) => t.id === id)?.label).filter(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full text-left" aria-expanded={open}>
        <div className="flex flex-wrap gap-1.5">
          {tagLabels.map((label) => (
            <span key={label} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
              {label}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">{recipe.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{recipe.prepMinutes} min</span>
          <span>·</span>
          <span>
            {recipe.servings} portion{recipe.servings > 1 ? "s" : ""}
          </span>
          <span>·</span>
          <span>{recipe.calories} kcal</span>
          <span>·</span>
          <span>{recipe.proteinG} g prot.</span>
          <span>·</span>
          <span>{recipe.carbsG} g gluc.</span>
          <span aria-hidden>{open ? "· Réduire" : "· Voir la recette"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Ingrédients</h4>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>·</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Préparation</h4>
            <ol className="mt-2 flex flex-col gap-2.5">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <span className="font-heading shrink-0 text-sm font-semibold text-accent-strong">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          {recipe.tip && (
            <p className="rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-muted">
              <span className="font-medium text-foreground">Astuce : </span>
              {recipe.tip}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
