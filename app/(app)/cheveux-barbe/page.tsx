"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { LockIcon } from "@/components/icons";
import {
  faceShapes,
  beardTrimSteps,
  haircutTips,
  loadFaceShape,
  saveFaceShape,
  type FaceShape,
} from "@/lib/hair";
import { loadPlan, type Plan } from "@/lib/subscription-store";

function StepList({ steps }: { steps: { title: string; why: string }[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
          <span className="font-heading shrink-0 text-xl font-semibold text-accent-strong">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{step.why}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function CheveuxBarbePage() {
  const [shape, setShape] = useState<FaceShape | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setShape(loadFaceShape());
    setPlan(loadPlan());
    setReady(true);
  }, []);

  function handleSelect(value: FaceShape) {
    setShape(value);
    saveFaceShape(value);
  }

  if (!ready) return null;

  const isPremium = plan === "premium";
  const selected = faceShapes.find((f) => f.value === shape);

  return (
    <>
      <AppTopBar title="Cheveux & barbe" idPrefix="cheveux-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <h2 className="text-base font-semibold text-foreground">Quelle est la forme de votre visage ?</h2>
        <p className="mt-1 text-sm text-muted">
          Une estimation suffit : c&rsquo;est vous qui choisissez, pas une analyse automatique.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {faceShapes.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleSelect(f.value)}
              aria-pressed={shape === f.value}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                shape === f.value
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              <span className="text-sm font-semibold text-foreground">{f.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-base font-semibold text-foreground">{selected.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{selected.description}</p>

            {isPremium ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Coupes suggérées</p>
                  <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                    {selected.hairStyles.map((tip) => (
                      <li key={tip}>· {tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Styles de barbe suggérés</p>
                  <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                    {selected.beardStyles.map((tip) => (
                      <li key={tip}>· {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                  <LockIcon className="h-4 w-4" />
                </div>
                <p className="text-sm text-muted">
                  Les suggestions détaillées de coupes et de styles de barbe pour votre
                  morphologie sont réservées au plan{" "}
                  <Link
                    href="/compte"
                    className="font-medium text-accent-strong underline underline-offset-2"
                  >
                    Premium
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        )}

        <h2 className="mt-8 text-base font-semibold text-foreground">Bien choisir sa coupe</h2>
        <StepList steps={haircutTips} />

        <h2 className="mt-8 text-base font-semibold text-foreground">Tuto : tailler sa barbe</h2>
        <StepList steps={beardTrimSteps} />
      </main>
    </>
  );
}
