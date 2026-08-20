"use client";

import { useRef, useState } from "react";
import { resizeImage } from "@/components/photo-slot";
import { ImageIcon, FilmIcon, XIcon } from "@/components/icons";
import type { NewPostMedia } from "@/app/(app)/communaute/actions";

// 16 Mo bruts max (voir communityMediaSchema côté serveur) — appliqué avant
// même l'encodage base64 pour donner une erreur claire immédiatement.
const MAX_MEDIA_BYTES = 16 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject());
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extrait jusqu'à 3 frames (début / milieu / fin) d'une vidéo côté client,
// pour que le serveur puisse les envoyer à la modération vision — l'API
// Claude ne prend pas de vidéo brute en entrée.
function extractVideoFrames(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const frames: string[] = [];
    const canvas = document.createElement("canvas");

    function cleanupAndResolve() {
      URL.revokeObjectURL(objectUrl);
      resolve(frames);
    }

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const raw = [0.1, duration / 2, Math.max(duration - 0.2, 0.1)];
      const timestamps = raw.filter((t, i) => t >= 0 && raw.indexOf(t) === i);
      let index = 0;

      const captureCurrentFrame = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx || !video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
      };

      const seekNext = () => {
        if (index >= timestamps.length) {
          cleanupAndResolve();
          return;
        }
        video.currentTime = timestamps[index];
      };

      video.onseeked = () => {
        captureCurrentFrame();
        index += 1;
        seekNext();
      };

      seekNext();
    };

    video.onerror = () => cleanupAndResolve();
  });
}

export function MediaPicker({
  value,
  onChange,
}: {
  value: NewPostMedia | null;
  onChange: (media: NewPostMedia | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (file.size > MAX_MEDIA_BYTES) {
      setError("Fichier trop volumineux (16 Mo maximum).");
      return;
    }

    setProcessing(true);
    try {
      if (file.type.startsWith("image/")) {
        const dataUrl = await readFileAsDataUrl(file);
        const resized = await resizeImage(dataUrl, 1600, 0.85);
        onChange({ dataUrl: resized, mediaType: "image" });
      } else if (file.type.startsWith("video/")) {
        const [dataUrl, previewFrames] = await Promise.all([
          readFileAsDataUrl(file),
          extractVideoFrames(file),
        ]);
        if (previewFrames.length === 0) {
          setError("Impossible de lire cette vidéo, essayez un autre fichier.");
          return;
        }
        onChange({ dataUrl, mediaType: "video", previewFrames });
      } else {
        setError("Formats acceptés : photo (JPEG, PNG, WebP) ou vidéo (MP4, WebM, MOV).");
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-border">
          {value.mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.dataUrl} alt="Aperçu" className="max-h-64 w-full object-cover" />
          ) : (
            <video src={value.dataUrl} controls className="max-h-64 w-full" />
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Retirer le média"
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground disabled:cursor-wait disabled:opacity-60"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <FilmIcon className="h-3.5 w-3.5" />
            {processing ? "Analyse du fichier…" : "Ajouter une photo ou une vidéo"}
          </button>
        </div>
      )}

      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : (
        !value && (
          <p className="mt-1.5 text-xs text-muted">
            Photo (JPEG/PNG/WebP) ou vidéo courte (MP4/WebM/MOV) — 16 Mo maximum, analysée automatiquement.
          </p>
        )
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
