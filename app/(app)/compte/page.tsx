"use client";

import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { ProgressChart } from "@/components/progress-chart";
import { CheckIcon, LockIcon } from "@/components/icons";
import { demoProfile, type Goal } from "@/lib/onboarding";
import { getUserData, saveUserPlan } from "@/app/actions/user-data";
import { generateAnalysis } from "@/lib/analysis";
import type { Plan } from "@/lib/user-data";

const pastEntries = [
  { label: "15 mai", date: "15 mai 2026", score: 64 },
  { label: "20 juin", date: "20 juin 2026", score: 71 },
];

const freeFeatures = [
  "1 bilan d'analyse par mois",
  "Plan nutrition simplifié",
  "Routine skincare de base",
  "Lecture des articles de la communauté",
];

const premiumFeatures = [
  "Bilans d'analyse illimités",
  "Plan nutrition détaillé avec macros",
  "Suivi photo comparatif dans le temps",
  "Analyse capillaire détaillée (coupe & barbe)",
  "Publier et commenter dans la communauté",
  "Support prioritaire",
];

export default function ComptePage() {
  const [goals, setGoals] = useState<Goal[]>(demoProfile.goals);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUserData().then(({ profile: saved, plan: userPlan }) => {
      if (saved) {
        setGoals(saved.goals);
        setPhotoDataUrl(saved.photoDataUrl);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
      setPlan(userPlan);
      setReady(true);
    });
  }, []);

  function handlePlanChange(next: Plan) {
    saveUserPlan(next);
    setPlan(next);
  }

  if (!ready) return null;

  const { overallScore } = generateAnalysis(goals);
  const history = [
    ...pastEntries,
    { label: "29 juil.", date: "29 juillet 2026", score: overallScore },
  ];
  const isPremium = plan === "premium";

  return (
    <>
      <AppTopBar title="Mon compte" idPrefix="compte-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {isDemo && <DemoProfileBanner />}

        <h2 className="mt-6 text-base font-semibold text-foreground">
          Votre progression
        </h2>
        {isPremium ? (
          <div className="mt-3 rounded-2xl border border-border bg-surface p-5">
            <ProgressChart
              points={history.map((entry) => ({ label: entry.label, value: entry.score }))}
            />
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted">
              Le suivi de votre progression dans le temps est disponible avec le
              plan <span className="font-medium text-foreground">Premium</span>.
            </p>
          </div>
        )}

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Historique des analyses
        </h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {[...history]
            .reverse()
            .slice(0, isPremium ? undefined : 1)
            .map((entry) => (
              <div
                key={entry.date}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
              >
                <span className="text-sm text-foreground">{entry.date}</span>
                <span className="font-heading text-lg font-semibold text-accent-strong">
                  {entry.score}
                  <span className="text-xs font-normal text-muted"> /100</span>
                </span>
              </div>
            ))}
          {!isPremium && (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                <LockIcon className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted">
                Le plan gratuit conserve 1 bilan par mois. Passez au Premium pour
                un historique illimité.
              </p>
            </div>
          )}
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Suivi photo comparatif
        </h2>
        {isPremium ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {["Photo initiale", "Aujourd'hui"].map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-surface p-3 text-center"
              >
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoDataUrl}
                    alt={label}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-surface-muted text-xs text-muted">
                    Pas de photo
                  </div>
                )}
                <p className="mt-2 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted">
              Comparez vos photos dans le temps avec le plan{" "}
              <span className="font-medium text-foreground">Premium</span>.
            </p>
          </div>
        )}

        <h2 className="mt-8 text-base font-semibold text-foreground">Abonnement</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Gratuit</h3>
              {!isPremium && (
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                  Plan actuel
                </span>
              )}
            </div>
            <p className="font-heading mt-2 text-2xl font-semibold text-foreground">0€</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPremium && (
              <button
                type="button"
                onClick={() => handlePlanChange("free")}
                className="mt-5 w-full rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
              >
                Repasser au plan gratuit
              </button>
            )}
          </div>

          <div className="glow relative rounded-2xl border border-accent/50 bg-surface p-5">
            <span className="bg-gradient-accent absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-semibold text-white">
              {isPremium ? "Plan actuel" : "Recommandé"}
            </span>
            <h3 className="text-base font-semibold text-foreground">Premium</h3>
            <p className="font-heading mt-2 text-2xl font-semibold text-foreground">
              9,99€ <span className="text-sm font-normal text-muted">/ mois</span>
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <p className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-surface-muted px-5 py-3 text-sm font-medium text-foreground">
                <CheckIcon className="h-4 w-4 text-accent-strong" />
                Vous êtes Premium
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handlePlanChange("premium")}
                className="bg-gradient-accent mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Passer au Premium
              </button>
            )}
            <p className="mt-2 text-center text-xs text-muted">
              Aperçu visuel — le paiement Stripe sera activé prochainement.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
