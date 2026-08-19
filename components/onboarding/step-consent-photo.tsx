"use client";

import { useRef } from "react";
import { CameraIcon, LockIcon } from "@/components/icons";
import type { OnboardingData } from "@/lib/onboarding";

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

function PhotoSlot({
  label,
  hint,
  required,
  capture,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  required: boolean;
  capture: "user" | "environment";
  value: string | null;
  disabled: boolean;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      resizeImage(reader.result).then(onChange);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {!required && <span className="text-xs text-muted">(optionnel)</span>}
      </div>

      {value ? (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={`Aperçu — ${label}`}
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
              onClick={() => onChange(null)}
              className="text-xs font-medium text-muted transition-colors hover:text-danger"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-accent/50"
        >
          <CameraIcon className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Ajouter la photo</span>
          <span className="text-xs text-muted">
            {disabled ? "Cochez la case ci-dessus pour activer l'envoi" : hint}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={capture}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export function StepConsentPhoto({
  data,
  update,
}: {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <LockIcon className="h-5 w-5" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-semibold text-foreground">
        Vos photos, en toute confiance
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Une photo de face et une photo de profil nous aident à personnaliser
        votre bilan visage et peau. Une photo de corps (facultative) permet en
        plus d&rsquo;évaluer votre posture, votre tonus musculaire et votre
        composition corporelle — sans elle, ces points restent neutres dans
        votre bilan. Vos photos restent strictement privées et ne sont jamais
        partagées ni publiées.
      </p>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted p-3.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={data.consentGiven}
          onChange={(e) => update({ consentGiven: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        <span>
          J&rsquo;autorise l&rsquo;utilisation de mes photos uniquement pour
          générer mon analyse personnalisée, conformément au RGPD. Je peux les
          supprimer à tout moment.
        </span>
      </label>

      <div className="mt-5 flex flex-col gap-4">
        <PhotoSlot
          label="Photo de face"
          hint="Visage dégagé, bien éclairé"
          required
          capture="user"
          value={data.photoDataUrl}
          disabled={!data.consentGiven}
          onChange={(v) => update({ photoDataUrl: v })}
        />
        <PhotoSlot
          label="Photo de profil"
          hint="Visage de côté"
          required
          capture="user"
          value={data.photoProfileDataUrl}
          disabled={!data.consentGiven}
          onChange={(v) => update({ photoProfileDataUrl: v })}
        />
        <PhotoSlot
          label="Photo de corps"
          hint="Torse dégagé, pour une analyse plus poussée (posture, tonus, composition)"
          required={false}
          capture="environment"
          value={data.photoBodyDataUrl}
          disabled={!data.consentGiven}
          onChange={(v) => update({ photoBodyDataUrl: v })}
        />
      </div>
    </div>
  );
}
