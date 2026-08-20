"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { ProgressChart } from "@/components/progress-chart";
import { CheckIcon, LockIcon } from "@/components/icons";
import { DeleteAccountSection } from "@/components/delete-account-section";
import { WeightTracker } from "@/components/weight-tracker";
import { getUserData, saveUserPlan } from "@/app/actions/user-data";
import { getBilanHistory, type StoredBilan } from "@/app/actions/bilan";
import { activityLevels, goalOptions } from "@/lib/onboarding";
import type { OnboardingData } from "@/lib/onboarding";
import type { Plan } from "@/lib/user-data";

const historyDayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const historyFullDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const freeFeatures = [
  "1 bilan d'analyse par mois",
  "Plan nutrition simplifié",
  "Routine skincare de base",
  "Lecture des articles de la communauté",
];

const premiumFeatures = [
  "Coach IA disponible au quotidien",
  "Bilans d'analyse illimités",
  "Plan nutrition détaillé avec macros",
  "Estimation de composition corporelle par photo",
  "Analyse de peau par IA avec recommandations d'ingrédients",
  "Suivi photo comparatif dans le temps",
  "Analyse capillaire détaillée (coupe & barbe)",
  "Publier et commenter dans la communauté",
  "Support prioritaire",
];

export default function ComptePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");
  const [history, setHistory] = useState<StoredBilan[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getBilanHistory()]).then(([{ profile: saved, plan: userPlan }, bilans]) => {
      if (saved) {
        setProfile(saved);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
      setPlan(userPlan);
      setHistory(bilans);
      setReady(true);
    });
  }, []);

  function handlePlanChange(next: Plan) {
    saveUserPlan(next);
    setPlan(next);
  }

  if (!ready) return null;

  const isPremium = plan === "premium";
  const visibleHistory = history.slice(0, isPremium ? undefined : 1);
  const bilansWithPhotos = history.filter((entry) => entry.photoDataUrl);

  return (
    <>
      <AppTopBar title="Mon compte" idPrefix="compte-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {user && (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "h-14 w-14" } }}
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {user.fullName || user.username || "Votre profil"}
              </p>
              <p className="truncate text-sm text-muted">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <p className="mt-1 text-xs text-muted">
                Cliquez sur votre photo pour modifier votre nom, votre e-mail, votre
                mot de passe ou votre photo de profil.
              </p>
            </div>
          </div>
        )}

        {isDemo && <DemoProfileBanner />}

        {!isDemo && profile && (
          <>
            <h2 className="mt-8 text-base font-semibold text-foreground">
              Vos informations
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
                <p className="text-xs text-muted">Âge</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {profile.age || "—"} {profile.age && "ans"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
                <p className="text-xs text-muted">Taille</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {profile.heightCm || "—"} {profile.heightCm && "cm"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
                <p className="text-xs text-muted">Poids de référence</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {profile.weightKg || "—"} {profile.weightKg && "kg"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
                <p className="text-xs text-muted">Activité</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {activityLevels.find((a) => a.value === profile.activityLevel)?.label ?? "—"}
                </p>
              </div>
            </div>

            {profile.goals.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.goals.map((goal) => {
                  const option = goalOptions.find((g) => g.value === goal);
                  return option ? (
                    <span
                      key={goal}
                      className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-strong"
                    >
                      {option.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <Link
              href="/onboarding"
              className="mt-3 inline-block text-sm font-medium text-accent-strong underline underline-offset-2 transition-colors hover:text-accent"
            >
              Modifier mes informations
            </Link>

            <WeightTracker isDemo={isDemo} />
          </>
        )}

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Votre progression
        </h2>
        {!isPremium ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted">
              Le suivi de votre progression dans le temps est disponible avec le
              plan <span className="font-medium text-foreground">Premium</span>.
            </p>
          </div>
        ) : history.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-border bg-surface p-5">
            <ProgressChart
              points={[...history]
                .reverse()
                .map((entry) => ({
                  label: historyDayMonth.format(new Date(entry.createdAt)),
                  value: entry.overallScore,
                }))}
            />
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <p className="text-sm text-muted">
              Pas encore de bilan enregistré. Générez votre premier bilan Analyse
              pour commencer le suivi de votre progression.
            </p>
          </div>
        )}

        <h2 className="mt-8 text-base font-semibold text-foreground">
          Historique des analyses
        </h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {visibleHistory.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
              <p className="text-sm text-muted">
                Aucun bilan pour l&rsquo;instant. Rendez-vous sur{" "}
                <Link href="/analyse" className="font-medium text-accent-strong underline underline-offset-2">
                  Analyse
                </Link>{" "}
                pour générer le premier.
              </p>
            </div>
          )}
          {visibleHistory.map((entry) => (
            <div
              key={entry.createdAt}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50"
            >
              <span className="text-sm text-foreground">
                {historyFullDate.format(new Date(entry.createdAt))}
              </span>
              <span className="font-heading text-lg font-semibold text-accent-strong">
                {entry.overallScore}
                <span className="text-xs font-normal text-muted"> /100</span>
              </span>
            </div>
          ))}
          {!isPremium && history.length > 1 && (
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
          <div className="mt-3 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
            <div className="flex shrink-0 gap-2">
              {[
                bilansWithPhotos.length > 0
                  ? bilansWithPhotos[bilansWithPhotos.length - 1].photoDataUrl
                  : profile?.photoDataUrl ?? null,
                bilansWithPhotos.length > 0 ? bilansWithPhotos[0].photoDataUrl : profile?.photoDataUrl ?? null,
              ].map((url, i) =>
                url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={i === 0 ? "Photo la plus ancienne" : "Photo la plus récente"}
                    className="h-16 w-16 rounded-xl object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div
                    key={i}
                    className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-muted text-xs text-muted"
                  >
                    —
                  </div>
                )
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                {bilansWithPhotos.length > 1
                  ? `${bilansWithPhotos.length} photos enregistrées avec vos bilans.`
                  : "Générez plusieurs bilans pour construire votre suivi photo."}
              </p>
              <Link
                href="/suivi"
                className="mt-1 inline-block text-sm font-medium text-accent-strong underline underline-offset-2"
              >
                Voir le suivi complet et mes conseils →
              </Link>
            </div>
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
          <div className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/50">
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

        {!isDemo && <DeleteAccountSection />}
      </main>
    </>
  );
}
