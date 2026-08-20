"use client";

import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/app-top-bar";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { SkinAnalysis } from "@/components/skin-analysis";
import { getUserData } from "@/app/actions/user-data";
import {
  morningRoutine,
  eveningRoutine,
  guaShaRoutine,
  filterSkincareIngredients,
  skincareNeeds,
  type RoutineStep,
} from "@/lib/skincare";

function RoutineList({ title, steps }: { title: string; steps: RoutineStep[] }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ol className="mt-3 flex flex-col gap-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="font-heading shrink-0 text-xl font-semibold text-accent-strong">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.why}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function SkincarePage() {
  const [isPremium, setIsPremium] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeNeed, setActiveNeed] = useState<string | null>(null);

  useEffect(() => {
    getUserData().then(({ plan }) => {
      setIsPremium(plan === "premium");
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const results = filterSkincareIngredients(activeNeed);
  const activeLabel = skincareNeeds.find((n) => n.id === activeNeed)?.label;

  return (
    <>
      <AppTopBar title="Routine skincare" idPrefix="skincare-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <HealthDisclaimer />

        <div className="mt-6 flex flex-col gap-8">
          <RoutineList title="Routine du matin" steps={morningRoutine} />
          <RoutineList title="Routine du soir" steps={eveningRoutine} />
          <RoutineList title="Routine gua sha" steps={guaShaRoutine} />
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Introduisez un nouveau produit à la fois et laissez quelques jours à
          votre peau pour s&rsquo;y habituer. En cas de réaction (rougeur,
          irritation), arrêtez et demandez conseil à un dermatologue.
        </p>

        <SkinAnalysis isPremium={isPremium} />

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Bibliothèque d&rsquo;ingrédients
        </h2>
        <p className="mt-1 text-sm text-muted">
          À quoi servent les actifs les plus courants et de niche, comment les utiliser et
          avec quelles précautions.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveNeed(null)}
            aria-pressed={activeNeed === null}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeNeed === null
                ? "border-accent bg-accent-soft text-accent-strong"
                : "border-border bg-surface text-muted hover:border-accent/40"
            }`}
          >
            Tous
          </button>
          {skincareNeeds.map((need) => (
            <button
              key={need.id}
              type="button"
              onClick={() => setActiveNeed((current) => (current === need.id ? null : need.id))}
              aria-pressed={activeNeed === need.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeNeed === need.id
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent/40"
              }`}
            >
              {need.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted">
          {results.length === 0
            ? "Aucun ingrédient dans cette catégorie."
            : activeLabel
              ? `${results.length} ingrédient${results.length > 1 ? "s" : ""} pour « ${activeLabel} »`
              : `${results.length} ingrédients au total, classiques et de niche.`}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {results.map((ingredient) => (
            <div
              key={ingredient.id}
              id={ingredient.id}
              className="scroll-mt-20 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{ingredient.name}</h3>
                {ingredient.niche && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent-strong uppercase">
                    Niche
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{ingredient.whatItDoes}</p>
              <p className="mt-2 text-sm text-foreground">
                <span className="font-medium">Usage : </span>
                <span className="text-muted">{ingredient.howToUse}</span>
              </p>
              <p className="mt-1 text-sm text-foreground">
                <span className="font-medium">Précaution : </span>
                <span className="text-muted">{ingredient.caution}</span>
              </p>
              <p className="mt-2 text-xs text-muted">Exemple accessible : {ingredient.exampleProduct}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
