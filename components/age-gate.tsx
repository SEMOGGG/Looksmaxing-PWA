"use client";

import { useEffect, useState } from "react";
import { ShieldCheckIcon } from "@/components/icons";
import { APP_NAME } from "@/lib/navigation";

const STORAGE_KEY = "faciem_age_verified";

export function AgeGate() {
  const [verified, setVerified] = useState(true);
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) === "true";
    setVerified(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || verified) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ready, verified]);

  if (!ready || verified) return null;

  function handleConfirm() {
    if (!checked) return;
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVerified(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div className="w-full max-w-sm rounded-t-3xl border border-border bg-surface p-6 shadow-xl sm:rounded-3xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          <ShieldCheckIcon className="h-5 w-5" />
        </div>
        <h2 id="age-gate-title" className="font-heading mt-4 text-xl font-medium text-foreground">
          Vérification de l&rsquo;âge
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {APP_NAME} propose des conseils liés à l&rsquo;apparence, à la nutrition et au
          bien-être, réservés aux personnes majeures. Merci de confirmer votre âge
          pour continuer.
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span>Je certifie avoir 18 ans ou plus.</span>
        </label>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!checked}
          className="mt-4 w-full rounded-full bg-accent-strong px-5 py-3 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:opacity-90"
        >
          Confirmer et continuer
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          Ce contenu n&rsquo;est pas destiné aux mineurs.
        </p>
      </div>
    </div>
  );
}
