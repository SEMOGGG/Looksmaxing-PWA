"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { ScoreRing } from "@/components/score-ring";
import { ArrowRightIcon, CheckIcon, SparklesIcon } from "@/components/icons";
import { demoProfile } from "@/lib/onboarding";
import { getUserData } from "@/app/actions/user-data";
import { getLatestBilan, generateBilan } from "@/app/actions/bilan";
import { generateAnalysis, type AnalysisResult } from "@/lib/analysis";

export default function AnalysePage() {
  const [isDemo, setIsDemo] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult>(generateAnalysis(demoProfile.goals));
  const [isAiBilan, setIsAiBilan] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getLatestBilan()]).then(([{ profile }, bilan]) => {
      if (profile) {
        setHasPhoto(Boolean(profile.photoDataUrl));
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }

      if (bilan) {
        setAnalysis({ overallScore: bilan.overallScore, categories: bilan.categories });
        setIsAiBilan(true);
      } else {
        setAnalysis(generateAnalysis(profile?.goals ?? demoProfile.goals));
      }
      setReady(true);
    });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const result = await generateBilan();
    setGenerating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAnalysis({ overallScore: result.result.overallScore, categories: result.result.categories });
    setIsAiBilan(true);
  }

  if (!ready) return null;

  const { overallScore, categories } = analysis;

  return (
    <>
      <AppTopBar title="Votre analyse" idPrefix="analyse-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <div className="flex flex-col gap-3">
          {isDemo && <DemoProfileBanner />}
          <HealthDisclaimer />
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
          <ScoreRing score={overallScore} idPrefix="analyse-score" />
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Score global
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {isAiBilan
                ? "Généré par IA à partir de votre photo de profil."
                : "Estimation basée sur vos objectifs, pas encore sur votre photo."}{" "}
              Elle évoluera au fil de vos prochains bilans, pas de comparaison avec qui
              que ce soit d&rsquo;autre.
            </p>
          </div>
        </div>

        {!isDemo && (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-5">
            {hasPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-gradient-accent w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  {generating
                    ? "Analyse en cours…"
                    : isAiBilan
                      ? "Régénérer mon bilan avec IA"
                      : "Générer mon bilan personnalisé avec IA"}
                </button>
                <p className="mt-2 text-xs text-muted">
                  Gratuit : 1 bilan IA par mois. Premium : illimité.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                <Link href="/onboarding" className="font-medium text-accent-strong underline underline-offset-2">
                  Ajoutez une photo à votre profil
                </Link>{" "}
                pour que votre bilan soit basé sur une vraie analyse IA plutôt que sur une
                estimation générale.
              </p>
            )}
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          </div>
        )}

        <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">
          Le détail par catégorie
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.key}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-foreground">
                  {category.label}
                </h4>
                <span className="font-heading text-lg font-semibold text-accent-strong">
                  {category.score}
                </span>
              </div>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  category.isFocus
                    ? "bg-accent-soft text-accent-strong"
                    : "bg-surface-muted text-muted"
                }`}
              >
                {category.isFocus ? (
                  <SparklesIcon className="h-3 w-3" />
                ) : (
                  <CheckIcon className="h-3 w-3" />
                )}
                {category.isFocus ? "Axe de progression" : "Point fort"}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {category.summary}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/nutrition"
            className="bg-gradient-accent flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Voir mon plan nutrition
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/routine"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
          >
            Voir ma routine
          </Link>
        </div>
      </main>
    </>
  );
}
