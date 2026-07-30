"use client";

import { useEffect, useState } from "react";
import { ProgressChart } from "@/components/progress-chart";
import { getWeightEntries, addWeightEntry, type WeightEntry } from "@/app/actions/weight";

export function WeightTracker({ isDemo }: { isDemo: boolean }) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getWeightEntries().then((data) => {
      setEntries(data);
      setReady(true);
    });
  }, []);

  async function handleAdd() {
    const value = parseFloat(draft.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    setSaving(true);
    const result = await addWeightEntry(value);
    if (result.ok) {
      setEntries(await getWeightEntries());
      setDraft("");
    }
    setSaving(false);
  }

  if (!ready) return null;

  const points = entries.map((entry) => ({
    label: new Date(entry.recordedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    value: entry.weightKg,
  }));
  const values = entries.map((entry) => entry.weightKg);
  const min = values.length ? Math.floor(Math.min(...values) - 2) : 0;
  const max = values.length ? Math.ceil(Math.max(...values) + 2) : 100;
  const latest = entries[entries.length - 1];
  const first = entries[0];
  const delta = latest && first && latest.id !== first.id ? latest.weightKg - first.weightKg : null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-foreground">Suivi du poids</h2>
        {latest && (
          <span className="font-heading text-2xl font-semibold text-accent-strong">
            {latest.weightKg} kg
          </span>
        )}
      </div>

      {isDemo ? (
        <p className="mt-2 text-sm text-muted">
          Complétez votre profil pour commencer à suivre votre poids dans le temps.
        </p>
      ) : (
        <>
          {points.length >= 2 ? (
            <div className="mt-4">
              <ProgressChart points={points} min={min} max={max} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Ajoutez au moins deux pesées pour voir apparaître votre courbe.
            </p>
          )}
          {delta !== null && (
            <p className="mt-2 text-xs text-muted">
              {delta === 0
                ? "Poids stable depuis votre première pesée."
                : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg depuis votre première pesée.`}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Peser aujourd'hui (kg)"
              className="flex-1 rounded-full border border-border bg-surface-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.trim() || saving}
              className="bg-gradient-accent rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enregistrer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
