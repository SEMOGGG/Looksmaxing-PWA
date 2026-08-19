"use client";

import { useRef } from "react";
import { CameraIcon } from "@/components/icons";

// Les photos prises directement depuis un téléphone dépassent souvent la
// limite de 6 Mo décodés (voir photoDataUrlSchema dans lib/validation.ts)
// et peuvent être dans un format non reconnu (HEIC...) — on les redimensionne
// et on les réencode systématiquement en JPEG avant de les stocker, pour ne
// jamais faire échouer silencieusement l'enregistrement plus tard.
export function resizeImage(dataUrl: string, maxDimension = 1280, quality = 0.82): Promise<string> {
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

export function PhotoSlot({
  label,
  hint,
  disabledHint,
  required,
  capture,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  hint: string;
  disabledHint?: string;
  required: boolean;
  capture: "user" | "environment";
  value: string | null;
  disabled?: boolean;
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
          <span className="text-xs text-muted">{disabled && disabledHint ? disabledHint : hint}</span>
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
