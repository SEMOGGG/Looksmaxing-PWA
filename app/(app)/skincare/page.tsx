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
  skincareIngredients,
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

  useEffect(() => {
    getUserData().then(({ plan }) => {
      setIsPremium(plan === "premium");
      setReady(true);
    });
  }, []);

  if (!ready) return null;

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
          À quoi servent les actifs les plus courants, comment les utiliser et
          avec quelles précautions.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {skincareIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              id={ingredient.id}
              className="scroll-mt-20 rounded-2xl border border-border bg-surface p-5"
            >
              <h3 className="text-base font-semibold text-foreground">{ingredient.name}</h3>
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
