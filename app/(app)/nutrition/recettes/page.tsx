"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { AppTopBar } from "@/components/app-top-bar";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { RecipeCard } from "@/components/nutrition/recipe-card";
import { RecipeSubmitForm } from "@/components/nutrition/recipe-submit-form";
import { LockIcon } from "@/components/icons";
import { recipeTags, filterRecipes, type Recipe } from "@/lib/recipes";
import { getRecipes, getMyRecipeSubmissions, type MyRecipeSubmission } from "@/app/actions/recipes";

const submissionStatusLabels: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Approuvée",
  rejected: "Non retenue",
};

export default function RecettesPage() {
  const { isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mySubmissions, setMySubmissions] = useState<MyRecipeSubmission[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [ready, setReady] = useState(false);

  function loadSubmissions() {
    if (isSignedIn) getMyRecipeSubmissions().then(setMySubmissions);
  }

  useEffect(() => {
    Promise.all([getRecipes(), isSignedIn ? getMyRecipeSubmissions() : Promise.resolve([])]).then(
      ([loadedRecipes, submissions]) => {
        setRecipes(loadedRecipes);
        setMySubmissions(submissions);
        setReady(true);
      }
    );
  }, [isSignedIn]);

  if (!ready) return null;

  const results = filterRecipes(recipes, activeTag);
  const activeLabel = recipeTags.find((t) => t.id === activeTag)?.label;

  return (
    <>
      <AppTopBar title="Livre de recettes" idPrefix="recettes-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <HealthDisclaimer />

        <p className="mt-4 text-sm leading-relaxed text-muted">
          {recipes.length} recettes testées, riches en protéines, en glucides ou en potassium
          selon vos besoins du moment, y compris des versions à la whey et à la crème de riz.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            aria-pressed={activeTag === null}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTag === null
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border bg-surface text-muted hover:border-accent/40"
            }`}
          >
            Toutes
          </button>
          {recipeTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveTag((current) => (current === tag.id ? null : tag.id))}
              aria-pressed={activeTag === tag.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeTag === tag.id
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent/40"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted">
          {results.length === 0
            ? "Aucune recette dans cette catégorie."
            : activeLabel
              ? `${results.length} recette${results.length > 1 ? "s" : ""} pour « ${activeLabel} »`
              : `${results.length} recettes au total.`}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <h2 className="text-base font-semibold text-foreground">Proposer une recette</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Vous avez une recette qui vous a bien aidé ? Partagez-la : elle sera vérifiée par un
            admin avant d&rsquo;apparaître dans le livre de recettes.
          </p>

          {mySubmissions.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {mySubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                >
                  <span className="text-foreground">{submission.title}</span>
                  <span
                    className={`text-xs font-medium ${
                      submission.status === "approved"
                        ? "text-accent-strong"
                        : submission.status === "rejected"
                          ? "text-danger"
                          : "text-muted"
                    }`}
                  >
                    {submissionStatusLabels[submission.status] ?? submission.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isSignedIn ? (
            showForm ? (
              <div className="mt-4">
                <RecipeSubmitForm onSubmitted={loadSubmissions} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-gradient-accent mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              >
                + Proposer une recette
              </button>
            )
          ) : (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                <LockIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Connectez-vous pour proposer une recette</p>
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
          )}
        </div>
      </main>
    </>
  );
}
