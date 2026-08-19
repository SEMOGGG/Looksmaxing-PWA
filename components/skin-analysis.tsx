"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CameraIcon, InfoIcon, LockIcon } from "@/components/icons";
import { resizeImage } from "@/components/photo-slot";
import { analyzeSkin, getLatestSkinAnalysis, type SkinAnalysisResult } from "@/app/actions/skin-analysis";
import { skincareIngredients } from "@/lib/skincare";

export function SkinAnalysis({ isPremium }: { isPremium: boolean }) {
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [consent, setConsent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPremium) {
      setReady(true);
      return;
    }
    getLatestSkinAnalysis().then((data) => {
      setResult(data);
      setReady(true);
    });
  }, [isPremium]);

  function handleFile(file: File | undefined) {
    if (!file || !consent) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") return;
      setAnalyzing(true);
      try {
        const resized = await resizeImage(reader.result);
        const response = await analyzeSkin(resized);
        if (!response.ok) {
          setError(response.error);
          return;
        }
        setResult(response.result);
      } catch {
        setError("Analyse indisponible, réessayez dans un instant.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  if (!ready) return null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground">Analyse de peau par IA</h2>

      <div className="mt-2 flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted px-4 py-3 text-xs leading-relaxed text-muted">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Analyse visuelle générale à titre indicatif, pas un diagnostic
          dermatologique. En cas de problème de peau persistant (acné, rougeurs,
          irritation), consultez un dermatologue.
        </p>
      </div>

      {!isPremium ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
            <LockIcon className="h-4 w-4" />
          </div>
          <p className="text-sm text-muted">
            Réservé aux membres{" "}
            <span className="font-medium text-foreground">Premium</span>.{" "}
            <Link href="/compte" className="font-medium text-accent-strong underline underline-offset-2">
              Débloquer
            </Link>
          </p>
        </div>
      ) : (
        <>
          {result && (
            <div className="mt-3 rounded-xl border border-border bg-surface-muted p-4">
              {result.points.length > 0 ? (
                <ul className="flex flex-col gap-1.5 text-sm text-foreground">
                  {result.points.map((point) => (
                    <li key={point}>· {point}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-medium text-foreground">Analyse non concluante</p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-muted">{result.notes}</p>
              {result.recommendedIngredients.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.recommendedIngredients.map((name) => {
                    const match = skincareIngredients.find((i) => i.name === name);
                    return (
                      <a
                        key={name}
                        href={match ? `#${match.id}` : undefined}
                        className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong"
                      >
                        {name}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            />
            <span>
              J&rsquo;autorise l&rsquo;envoi de cette photo à notre service d&rsquo;analyse
              pour cette évaluation uniquement ; la photo n&rsquo;est pas conservée.
            </span>
          </label>

          <button
            type="button"
            disabled={!consent || analyzing}
            onClick={() => inputRef.current?.click()}
            className="mt-3 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-accent/50"
          >
            <CameraIcon className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {analyzing ? "Analyse en cours…" : "Envoyer une photo de mon visage"}
            </span>
            <span className="text-xs text-muted">Inclus dans votre abonnement Premium</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </>
      )}
    </div>
  );
}
