"use client";

import { useEffect, useState } from "react";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { ProgressChart } from "@/components/progress-chart";
import { CheckIcon } from "@/components/icons";
import { demoProfile, type Goal } from "@/lib/onboarding";
import { loadProfile } from "@/lib/profile-store";
import { generateAnalysis } from "@/lib/analysis";

const pastEntries = [
  { label: "15 mai", date: "15 mai 2026", score: 64 },
  { label: "20 juin", date: "20 juin 2026", score: 71 },
];

const freeFeatures = [
  "1 bilan d'analyse par mois",
  "Plan nutrition simplifié",
  "Routine skincare de base",
];

const premiumFeatures = [
  "Bilans d'analyse illimités",
  "Plan nutrition détaillé avec macros",
  "Suivi photo comparatif dans le temps",
  "Support prioritaire",
];

export default function ComptePage() {
  const [goals, setGoals] = useState<Goal[]>(demoProfile.goals);
  const [isDemo, setIsDemo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadProfile();
    if (saved) {
      setGoals(saved.goals);
      setIsDemo(false);
    } else {
      setIsDemo(true);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  const { overallScore } = generateAnalysis(goals);
  const history = [
    ...pastEntries,
    { label: "29 juil.", date: "29 juillet 2026", score: overallScore },
  ];

  return (
    <>
      <AppTopBar title="Mon compte" idPrefix="compte-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {isDemo && <DemoProfileBanner />}

        <h2 className="mt-6 text-base font-semibold text-foreground">
          Votre progression
        </h2>
        <div className="mt-3 rounded-2xl border border-border bg-surface p-5">
          <ProgressChart
            points={history.map((entry) => ({ label: entry.label, value: entry.score }))}
          />
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Historique des analyses
        </h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {[...history].reverse().map((entry) => (
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
        </div>

        <h2 className="mt-8 text-base font-semibold text-foreground">Abonnement</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Gratuit</h3>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
                Plan actuel
              </span>
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
          </div>

          <div className="glow relative rounded-2xl border border-accent/50 bg-surface p-5">
            <span className="bg-gradient-accent absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-semibold text-white">
              Recommandé
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
            <button
              type="button"
              className="bg-gradient-accent mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Passer au Premium
            </button>
            <p className="mt-2 text-center text-xs text-muted">
              Aperçu visuel — le paiement Stripe sera activé prochainement.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
