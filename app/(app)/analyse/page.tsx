"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { DemoProfileBanner } from "@/components/demo-profile-banner";
import { HealthDisclaimer } from "@/components/health-disclaimer";
import { ScoreRing } from "@/components/score-ring";
import { PhotoSlot } from "@/components/photo-slot";
import { ArrowRightIcon, CheckIcon, SparklesIcon } from "@/components/icons";
import { demoProfile, type Goal } from "@/lib/onboarding";
import { getUserData } from "@/app/actions/user-data";
import { getBilanHistory, generateBilan, type NewBilanPhotos, type StoredBilan } from "@/app/actions/bilan";
import { generateAnalysis } from "@/lib/analysis";

function scoreDelta(current: number, previous: number | undefined) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return { label: "=", className: "text-muted" };
  return diff > 0
    ? { label: `+${diff}`, className: "text-success" }
    : { label: `${diff}`, className: "text-danger" };
}

export default function AnalysePage() {
  const [isDemo, setIsDemo] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(demoProfile.goals);
  const [history, setHistory] = useState<StoredBilan[]>([]);
  const [photos, setPhotos] = useState<NewBilanPhotos>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getBilanHistory()]).then(([{ profile }, hist]) => {
      if (profile) {
        setIsDemo(false);
        setGoals(profile.goals);
        setPhotos({
          photoDataUrl: profile.photoDataUrl,
          photoProfileDataUrl: profile.photoProfileDataUrl,
          photoBodyDataUrl: profile.photoBodyDataUrl,
        });
      } else {
        setIsDemo(true);
      }
      setHistory(hist);
      setReady(true);
    });
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const result = await generateBilan(photos);
    setGenerating(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHistory((prev) => [result.result, ...prev]);
  }

  if (!ready) return null;

  const current = history[0];
  const previous = history[1];
  const isAiBilan = Boolean(current);
  const { overallScore, categories } = current
    ? { overallScore: current.overallScore, categories: current.categories }
    : generateAnalysis(goals);
  const canGenerate = Boolean(photos.photoDataUrl && photos.photoProfileDataUrl);
  const overallDelta = scoreDelta(overallScore, previous?.overallScore);

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
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Score global
              </h2>
              {overallDelta && (
                <span className={`text-sm font-semibold ${overallDelta.className}`}>
                  {overallDelta.label}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {isAiBilan
                ? "Généré par IA à partir de vos photos."
                : "Estimation basée sur vos objectifs, pas encore sur vos photos."}{" "}
              {previous
                ? "Comparée à votre bilan précédent, pas à qui que ce soit d'autre."
                : "Elle évoluera au fil de vos prochains bilans, pas de comparaison avec qui que ce soit d'autre."}
            </p>
          </div>
        </div>

        {!isDemo && (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground">
              {isAiBilan ? "Suivi : de nouvelles photos ?" : "Vos photos pour ce bilan"}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {isAiBilan
                ? "Remplacez une ou plusieurs photos pour un suivi hebdomadaire de votre progression, ou laissez-les telles quelles pour relancer l'analyse à l'identique."
                : "Ajoutez au moins une photo de face et une photo de profil."}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <PhotoSlot
                label="Photo de face"
                hint="Visage dégagé, bien éclairé"
                required
                capture="user"
                value={photos.photoDataUrl ?? null}
                onChange={(v) => setPhotos((p) => ({ ...p, photoDataUrl: v }))}
              />
              <PhotoSlot
                label="Photo de profil"
                hint="Visage de côté"
                required
                capture="user"
                value={photos.photoProfileDataUrl ?? null}
                onChange={(v) => setPhotos((p) => ({ ...p, photoProfileDataUrl: v }))}
              />
              <PhotoSlot
                label="Photo de corps"
                hint="Torse dégagé, pour évaluer posture, tonus et composition"
                required={false}
                capture="environment"
                value={photos.photoBodyDataUrl ?? null}
                onChange={(v) => setPhotos((p) => ({ ...p, photoBodyDataUrl: v }))}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
              className="bg-gradient-accent mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {generating
                ? "Analyse en cours…"
                : isAiBilan
                  ? "Régénérer mon bilan avec IA"
                  : "Générer mon bilan personnalisé avec IA"}
            </button>
            <p className="mt-2 text-xs text-muted">
              Gratuit : 1 bilan IA par mois. Premium : illimité — pour un vrai suivi hebdomadaire.
            </p>
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          </div>
        )}

        <h3 className="mt-8 text-sm font-semibold tracking-wide text-muted uppercase">
          Le détail par catégorie
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const previousScore = previous?.categories.find((c) => c.key === category.key)?.score;
            const delta = scoreDelta(category.score, previousScore);
            return (
              <div
                key={category.key}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-foreground">
                    {category.label}
                  </h4>
                  <span className="flex items-center gap-1.5">
                    <span className="font-heading text-lg font-semibold text-accent-strong">
                      {category.score}
                    </span>
                    {delta && (
                      <span className={`text-xs font-semibold ${delta.className}`}>{delta.label}</span>
                    )}
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
            );
          })}
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
