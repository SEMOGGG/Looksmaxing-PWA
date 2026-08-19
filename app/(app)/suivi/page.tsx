"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { ProgressChart } from "@/components/progress-chart";
import { CheckIcon, LockIcon, SparklesIcon } from "@/components/icons";
import { getUserData } from "@/app/actions/user-data";
import { getBilanHistory, type StoredBilan } from "@/app/actions/bilan";
import type { Plan } from "@/lib/user-data";

const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const fullDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function scoreDelta(current: number, previous: number | undefined) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return { label: "Stable", className: "text-muted" };
  return diff > 0
    ? { label: `+${diff}`, className: "text-success" }
    : { label: `${diff}`, className: "text-danger" };
}

export default function SuiviPage() {
  const [plan, setPlan] = useState<Plan>("free");
  const [history, setHistory] = useState<StoredBilan[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getBilanHistory()]).then(([{ plan: userPlan }, hist]) => {
      setPlan(userPlan);
      setHistory(hist);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  const isPremium = plan === "premium";
  const latest = history[0];
  const previous = history[1];
  const first = history[history.length - 1];
  const chronological = [...history].reverse();
  const photosChronological = chronological.filter((entry) => entry.photoDataUrl);

  return (
    <>
      <AppTopBar title="Suivi de progression" idPrefix="suivi-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {!isPremium ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
              <LockIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted">
              Le suivi complet (courbe, photos dans le temps, évolution par catégorie) est
              disponible avec le plan <span className="font-medium text-foreground">Premium</span>.{" "}
              <Link href="/compte" className="font-medium text-accent-strong underline underline-offset-2">
                Débloquer
              </Link>
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-5">
            <p className="text-sm text-muted">
              Aucun bilan pour l&rsquo;instant.{" "}
              <Link href="/analyse" className="font-medium text-accent-strong underline underline-offset-2">
                Générez votre premier bilan
              </Link>{" "}
              pour commencer votre suivi.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold text-foreground">Score global dans le temps</h2>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-5">
              <ProgressChart
                points={chronological.map((entry) => ({
                  label: dayMonth.format(new Date(entry.createdAt)),
                  value: entry.overallScore,
                }))}
              />
              {first && latest && first !== latest && (
                <p className="mt-3 text-xs text-muted">
                  Depuis votre premier bilan ({fullDate.format(new Date(first.createdAt))}) :{" "}
                  <span
                    className={
                      scoreDelta(latest.overallScore, first.overallScore)?.className ?? "text-muted"
                    }
                  >
                    {scoreDelta(latest.overallScore, first.overallScore)?.label}
                  </span>
                </p>
              )}
            </div>

            {photosChronological.length > 0 && (
              <>
                <h2 className="mt-8 text-base font-semibold text-foreground">Vos photos dans le temps</h2>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {photosChronological.map((entry) => (
                    <div
                      key={entry.createdAt}
                      className="w-28 shrink-0 rounded-2xl border border-border bg-surface p-2 text-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.photoDataUrl ?? undefined}
                        alt={fullDate.format(new Date(entry.createdAt))}
                        className="aspect-square w-full rounded-xl object-cover"
                      />
                      <p className="mt-1.5 text-[11px] leading-tight text-muted">
                        {dayMonth.format(new Date(entry.createdAt))}
                      </p>
                      <p className="text-xs font-semibold text-accent-strong">{entry.overallScore}/100</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {latest && previous && (
              <>
                <h2 className="mt-8 text-base font-semibold text-foreground">
                  Évolution depuis votre dernier bilan
                </h2>
                <div className="mt-3 flex flex-col gap-2.5">
                  {latest.categories.map((category) => {
                    const previousScore = previous.categories.find((c) => c.key === category.key)?.score;
                    const delta = scoreDelta(category.score, previousScore);
                    if (!delta) return null;
                    return (
                      <div
                        key={category.key}
                        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
                      >
                        <span className="text-sm text-foreground">{category.label}</span>
                        <span className={`text-sm font-semibold ${delta.className}`}>{delta.label}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {latest && (
              <>
                <h2 className="mt-8 text-base font-semibold text-foreground">
                  Vos conseils actuels
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Basés sur votre dernier bilan du {fullDate.format(new Date(latest.createdAt))}.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {latest.categories.map((category) => (
                    <div key={category.key} className="rounded-2xl border border-border bg-surface p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-semibold text-foreground">{category.label}</h4>
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
                      <p className="mt-3 text-sm leading-relaxed text-muted">{category.summary}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="mt-8 text-base font-semibold text-foreground">Historique complet</h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {history.map((entry) => (
                <div
                  key={entry.createdAt}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
                >
                  <span className="text-sm text-foreground">{fullDate.format(new Date(entry.createdAt))}</span>
                  <span className="font-heading text-lg font-semibold text-accent-strong">
                    {entry.overallScore}
                    <span className="text-xs font-normal text-muted"> /100</span>
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/analyse"
              className="bg-gradient-accent mt-8 flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Générer un nouveau bilan
            </Link>
          </>
        )}
      </main>
    </>
  );
}
