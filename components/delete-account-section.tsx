"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { deleteAccount } from "@/app/actions/delete-account";

export function DeleteAccountSection() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (!result.ok) {
      setDeleting(false);
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }
    await signOut();
    router.push("/");
  }

  return (
    <div className="mt-4 rounded-2xl border border-danger/30 bg-surface p-5">
      <h3 className="text-base font-semibold text-foreground">Supprimer mon compte</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Supprime définitivement votre profil, votre historique et vos publications
        dans la communauté. Cette action est irréversible.
      </p>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {confirming ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Suppression…" : "Confirmer la suppression"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-full border border-danger/50 px-5 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          Supprimer mon compte
        </button>
      )}
    </div>
  );
}
