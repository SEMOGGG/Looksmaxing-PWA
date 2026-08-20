"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { NavIcon, ArrowRightIcon, SparklesIcon, LeafIcon } from "@/components/icons";
import { routineNav } from "@/lib/navigation";
import { getUserData } from "@/app/actions/user-data";
import { getBilanHistory } from "@/app/actions/bilan";
import { getSkincareIngredients } from "@/app/actions/skincare";
import { demoProfile, goalOptions, type Goal } from "@/lib/onboarding";
import { dailyRoutineTip, routineHighlights } from "@/lib/routine-tips";
import type { SkincareIngredient } from "@/lib/skincare";

const defaultHighlights: Record<string, string> = {
  "/skincare": "Routine matin & soir",
  "/cheveux-barbe": "Selon votre visage",
  "/complements": "Repères sûrs",
};

export default function RoutinePage() {
  const [goals, setGoals] = useState<Goal[]>(demoProfile.goals);
  const [skinFocus, setSkinFocus] = useState<{ score: number; isFocus: boolean } | null>(null);
  const [ingredients, setIngredients] = useState<SkincareIngredient[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getBilanHistory(), getSkincareIngredients()]).then(
      ([{ profile }, history, loadedIngredients]) => {
        setGoals(profile?.goals ?? demoProfile.goals);
        const latest = history[0];
        const peau = latest?.categories.find((c) => c.key === "peau");
        setSkinFocus(peau ? { score: peau.score, isFocus: peau.isFocus } : null);
        setIngredients(loadedIngredients);
        setReady(true);
      }
    );
  }, []);

  if (!ready) return null;

  const tip = dailyRoutineTip(ingredients);
  const highlights = { ...defaultHighlights, ...routineHighlights(goals) };
  const primaryGoalLabel = goalOptions.find((g) => g.value === goals[0])?.label;

  return (
    <>
      <AppTopBar title="Routine" idPrefix="routine-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <p className="text-sm leading-relaxed text-muted">
          {primaryGoalLabel
            ? `Ce qui prend soin de votre apparence au quotidien, orienté vers votre objectif : ${primaryGoalLabel.toLowerCase()}.`
            : "Tout ce qui prend soin de votre apparence au quotidien, en un seul endroit."}
        </p>

        {skinFocus && (
          <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-accent-strong">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Votre peau : {skinFocus.score}/100
                  {skinFocus.isFocus && <span className="text-accent-strong"> · axe de progression</span>}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Le duo le plus efficace pour progresser ici : vitamine C le matin, actif ciblé
                  (rétinol ou AHA/BHA) le soir en alternance.
                </p>
              </div>
            </div>
            <Link
              href="/skincare"
              className="shrink-0 rounded-full border border-accent/40 px-4 py-2 text-center text-xs font-semibold text-accent-strong transition-colors hover:bg-surface sm:self-center"
            >
              Voir ma routine peau
            </Link>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {routineNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong transition-transform group-hover:scale-110">
                <NavIcon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {item.label}
                </span>
                <span className="block text-sm text-muted">{item.description}</span>
                {highlights[item.href] && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-accent-strong">
                    {highlights[item.href]}
                  </span>
                )}
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

        <h2 className="mt-9 text-sm font-semibold tracking-wide text-muted uppercase">
          Astuces du jour
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              <LeafIcon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">
              Technique naturelle
            </p>
            <h3 className="mt-1 text-base font-semibold text-foreground">{tip.technique.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{tip.technique.description}</p>
          </div>
          {tip.active && (
            <div className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <p className="mt-3 text-xs font-medium tracking-wide text-muted uppercase">
                Actif de niche à connaître
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">{tip.active.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{tip.active.description}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          Une nouvelle astuce chaque jour. Retrouvez la bibliothèque complète d&rsquo;ingrédients
          dans votre{" "}
          <Link href="/skincare" className="font-medium text-accent-strong underline underline-offset-2">
            routine skincare
          </Link>
          .
        </p>
      </main>
    </>
  );
}
