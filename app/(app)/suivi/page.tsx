"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { ProgressChart } from "@/components/progress-chart";
import { CheckIcon, LockIcon, SparklesIcon, TrashIcon, XIcon } from "@/components/icons";
import { getUserData } from "@/app/actions/user-data";
import { getBilanHistory, deleteBilan, type StoredBilan } from "@/app/actions/bilan";
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

function PhotoTimeline({
  title,
  entries,
  getUrl,
  confirmingId,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  title: string;
  entries: StoredBilan[];
  getUrl: (entry: StoredBilan) => string | null;
  confirmingId: string | null;
  onRequestDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  const withPhoto = entries.filter((entry) => getUrl(entry));
  if (withPhoto.length === 0) return null;

  return (
    <>
      <h3 className="mt-5 text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
        {withPhoto.map((entry) => (
          <div
            key={entry.id}
            className="relative w-28 shrink-0 rounded-2xl border border-border bg-surface p-2 text-center transition-colors hover:border-accent/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getUrl(entry) ?? undefined}
              alt={fullDate.format(new Date(entry.createdAt))}
              className="aspect-square w-full rounded-xl object-cover transition-transform hover:scale-105"
            />
            <p className="mt-1.5 text-[11px] leading-tight text-muted">
              {dayMonth.format(new Date(entry.createdAt))}
            </p>
            <p className="text-xs font-semibold text-accent-strong">{entry.overallScore}/100</p>

            {confirmingId === entry.id ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-background/95 p-2">
                <p className="text-[10px] leading-tight text-foreground">Supprimer ce bilan ?</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onConfirmDelete(entry.id)}
                    className="rounded-full bg-danger px-2 py-1 text-[10px] font-semibold text-white"
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="rounded-full border border-border px-2 py-1 text-[10px] font-medium text-muted"
                  >
                    Non
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequestDelete(entry.id)}
                aria-label="Supprimer ce bilan"
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-danger"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function SuiviPage() {
  const [plan, setPlan] = useState<Plan>("free");
  const [history, setHistory] = useState<StoredBilan[]>([]);
  const [ready, setReady] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getUserData(), getBilanHistory()]).then(([{ plan: userPlan }, hist]) => {
      setPlan(userPlan);
      setHistory(hist);
      setReady(true);
    });
  }, []);

  async function handleConfirmDelete(id: string) {
    setDeleting(true);
    const result = await deleteBilan(id);
    setDeleting(false);
    setConfirmingId(null);
    if (result.ok) {
      setHistory((prev) => prev.filter((entry) => entry.id !== id));
    }
  }

  if (!ready) return null;

  const isPremium = plan === "premium";
  const latest = history[0];
  const previous = history[1];
  const first = history[history.length - 1];
  const chronological = [...history].reverse();
  const hasAnyPhoto = chronological.some(
    (entry) => entry.photoDataUrl || entry.photoProfileDataUrl || entry.photoBodyDataUrl
  );

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

            {hasAnyPhoto && (
              <>
                <div className="mt-8 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">Vos photos dans le temps</h2>
                  {deleting && <p className="text-xs text-muted">Suppression…</p>}
                </div>
                <p className="mt-1 text-xs text-muted">
                  Des doublons ou un test qui fausse le suivi ? Survolez une photo pour la supprimer.
                </p>
                <PhotoTimeline
                  title="Visage de face"
                  entries={chronological}
                  getUrl={(entry) => entry.photoDataUrl}
                  confirmingId={confirmingId}
                  onRequestDelete={setConfirmingId}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={() => setConfirmingId(null)}
                />
                <PhotoTimeline
                  title="Visage de profil"
                  entries={chronological}
                  getUrl={(entry) => entry.photoProfileDataUrl}
                  confirmingId={confirmingId}
                  onRequestDelete={setConfirmingId}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={() => setConfirmingId(null)}
                />
                <PhotoTimeline
                  title="Corps"
                  entries={chronological}
                  getUrl={(entry) => entry.photoBodyDataUrl}
                  confirmingId={confirmingId}
                  onRequestDelete={setConfirmingId}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={() => setConfirmingId(null)}
                />
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
                    <div
                      key={category.key}
                      className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
                    >
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
              {history.map((entry) =>
                confirmingId === entry.id ? (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-danger/40 bg-surface p-4"
                  >
                    <span className="text-sm text-foreground">Supprimer ce bilan définitivement ?</span>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(entry.id)}
                        className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted"
                        aria-label="Annuler"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/30"
                  >
                    <span className="text-sm text-foreground">{fullDate.format(new Date(entry.createdAt))}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-heading text-lg font-semibold text-accent-strong">
                        {entry.overallScore}
                        <span className="text-xs font-normal text-muted"> /100</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(entry.id)}
                        aria-label="Supprimer ce bilan"
                        className="text-muted transition-colors hover:text-danger"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
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
