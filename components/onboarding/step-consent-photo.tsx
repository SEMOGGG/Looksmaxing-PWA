"use client";

import { useRef } from "react";
import { CameraIcon, LockIcon } from "@/components/icons";
import type { OnboardingData } from "@/lib/onboarding";

export function StepConsentPhoto({
  data,
  update,
}: {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Les photos prises directement depuis un téléphone dépassent souvent la
  // limite de 6 Mo décodés (voir photoDataUrlSchema dans lib/validation.ts)
  // et peuvent être dans un format non reconnu (HEIC...) — on les redimensionne
  // et on les réencode systématiquement en JPEG avant de les stocker, pour ne
  // jamais faire échouer silencieusement l'enregistrement du profil plus tard.
  function resizeImage(dataUrl: string, maxDimension = 1280, quality = 0.82): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      resizeImage(reader.result).then((resized) => update({ photoDataUrl: resized }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <LockIcon className="h-5 w-5" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-semibold text-foreground">
        Votre photo, en toute confiance
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Une photo nous aide à personnaliser votre bilan. Elle reste strictement
        privée et n&rsquo;est jamais partagée ni publiée. Cette étape est
        facultative : vous pouvez continuer sans photo.
      </p>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={data.consentGiven}
          onChange={(e) => update({ consentGiven: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        <span>
          J&rsquo;autorise l&rsquo;utilisation de ma photo uniquement pour générer mon
          analyse personnalisée, conformément au RGPD. Je peux la supprimer à
          tout moment.
        </span>
      </label>

      <div className="mt-5">
        {data.photoDataUrl ? (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.photoDataUrl}
              alt="Aperçu de votre photo"
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div className="flex flex-1 flex-col gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/50"
              >
                Changer la photo
              </button>
              <button
                type="button"
                onClick={() => update({ photoDataUrl: null })}
                className="text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={!data.consentGiven}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-accent/50"
          >
            <CameraIcon className="h-6 w-6 text-accent" />
            <span className="text-sm font-medium text-foreground">
              Ajouter une photo
            </span>
            <span className="text-xs text-muted">
              {data.consentGiven
                ? "JPG ou PNG, uniquement stockée sur cet appareil pour cette démo"
                : "Cochez la case ci-dessus pour activer l'envoi"}
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
