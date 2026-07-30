"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { LockIcon } from "@/components/icons";
import { WeightTracker } from "@/components/weight-tracker";
import { BodyComposition } from "@/components/body-composition";
import { demoProfile, type OnboardingData } from "@/lib/onboarding";
import { getUserData, saveUserProfile } from "@/app/actions/user-data";
import { calculateTargets, calculateHydrationTargets } from "@/lib/nutrition";
import type { Plan } from "@/lib/user-data";

const adjustmentCopy = {
  deficit: {
    label: "Léger déficit calorique",
    text: "Adapté à votre objectif de perte de gras : environ 400 kcal sous votre dépense totale, pour une perte progressive et durable.",
  },
  surplus: {
    label: "Léger surplus calorique",
    text: "Adapté à votre objectif de prise de masse : environ 300 kcal au-dessus de votre dépense totale, pour favoriser la construction musculaire.",
  },
  maintien: {
    label: "Maintien calorique",
    text: "Vos apports couvrent votre dépense totale, pour stabiliser votre poids actuel.",
  },
} as const;

export default function NutritionPage() {
  const [profile, setProfile] = useState<OnboardingData>(demoProfile);
  const [isDemo, setIsDemo] = useState(false);
  const [ready, setReady] = useState(false);
  const [steps, setSteps] = useState("");
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    getUserData().then(({ profile: saved, plan: userPlan }) => {
      if (saved) {
        setProfile(saved);
        setSteps(saved.steps);
        setIsDemo(false);
      } else {
        setSteps(demoProfile.steps);
        setIsDemo(true);
      }
      setPlan(userPlan);
      setReady(true);
    });
  }, []);

  function handleStepsChange(value: string) {
    setSteps(value);
    if (!isDemo) saveUserProfile({ ...profile, steps: value });
  }

  if (!ready) return null;

  const targets = calculateTargets(profile);
  const totalCal = targets.proteinG * 4 + targets.carbsG * 4 + targets.fatG * 9;
  const proteinPct = Math.round(((targets.proteinG * 4) / totalCal) * 100);
  const carbsPct = Math.round(((targets.carbsG * 4) / totalCal) * 100);
  const fatPct = 100 - proteinPct - carbsPct;
  const adjustment = adjustmentCopy[targets.adjustment];
  const hydration = calculateHydrationTargets(profile);

  return (
    <>
      <AppTopBar title="Plan nutritionnel" idPrefix="nutrition-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <div className="flex flex-col gap-3">
          {isDemo && <DemoProfileBanner />}
          <HealthDisclaimer />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Vos besoins énergétiques</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {targets.bmr} <span className="text-sm font-normal text-muted">kcal</span>
              </p>
              <p className="mt-1 text-xs text-muted">Métabolisme de base (BMR)</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {targets.tdee} <span className="text-sm font-normal text-muted">kcal</span>
              </p>
              <p className="mt-1 text-xs text-muted">Dépense totale (TDEE)</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Calculé avec la formule de <strong className="text-foreground">Mifflin-St Jeor</strong> à
            partir de votre âge, taille, poids et sexe, puis ajusté selon votre
            niveau d&rsquo;activité.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-foreground">Objectif calorique</h2>
            <span className="font-heading text-2xl font-semibold text-accent-strong">
              {targets.calories} kcal
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{adjustment.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{adjustment.text}</p>
        </div>

        <WeightTracker isDemo={isDemo} />
        <BodyComposition isPremium={plan === "premium"} />

        {plan === "premium" ? (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground">
              Répartition des macronutriments
            </h2>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full">
              <div className="bg-accent" style={{ width: `${proteinPct}%` }} />
              <div className="bg-accent-2" style={{ width: `${carbsPct}%` }} />
              <div className="bg-muted" style={{ width: `${fatPct}%` }} />
            </div>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Protéines
                </span>
                <span className="text-muted">{targets.proteinG} g · {proteinPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent-2" /> Glucides
                </span>
                <span className="text-muted">{targets.carbsG} g · {carbsPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted" /> Lipides
                </span>
                <span className="text-muted">{targets.fatG} g · {fatPct}%</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Protéines calculées à {targets.proteinPerKg.toFixed(1)} g par kg de poids
              de corps, ajustées à votre niveau d&rsquo;activité (1,8 g/kg minimum,
              jusqu&rsquo;à 2,0-2,2 g/kg pour les niveaux les plus actifs).
            </p>
          </div>
        ) : (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Répartition détaillée des macronutriments
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Le plan gratuit affiche votre objectif calorique global. Passez au{" "}
                <Link href="/compte" className="font-medium text-accent-strong underline underline-offset-2">
                  plan Premium
                </Link>{" "}
                pour voir le détail protéines / glucides / lipides en grammes.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">
            Hydratation & rétention d&rsquo;eau
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {(hydration.waterMl / 1000).toFixed(1)}{" "}
                <span className="text-sm font-normal text-muted">L / jour</span>
              </p>
              <p className="mt-1 text-xs text-muted">Eau, ajustée à votre activité</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                ≤ {hydration.sodiumMaxMg} <span className="text-sm font-normal text-muted">mg</span>
              </p>
              <p className="mt-1 text-xs text-muted">Sodium maximum par jour</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground">
            Potassium visé : ≥ {hydration.potassiumTargetMg} mg/jour
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Un ratio sodium/potassium bas (peu de sodium, assez de potassium — légumes,
            fruits, légumineuses) est associé à une meilleure régulation de l&rsquo;eau
            corporelle. Le potassium se trouve par exemple dans la patate douce, la
            banane, les épinards ou les haricots blancs ; le sodium principalement dans
            les plats préparés, la charcuterie et les snacks salés.
          </p>
        </div>

        <label className="mt-4 block rounded-2xl border border-border bg-surface p-5">
          <span className="text-base font-semibold text-foreground">Pas quotidiens</span>
          <p className="mt-1 text-xs text-muted">
            Un repère à ajuster au fil de vos journées, sans objectif universel.
          </p>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={40000}
            value={steps}
            onChange={(e) => handleStepsChange(e.target.value)}
            className="mt-3 w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none"
          />
        </label>
      </main>
    </>
  );
}
