"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";

export function StepAccount({
  saving,
  saveError,
  onRetry,
  onBack,
}: {
  saving: boolean;
  saveError?: string | null;
  onRetry?: () => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {saveError ? "Votre profil n'a pas pu être enregistré" : "Créez votre compte"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {saveError
          ? "Vous êtes bien connecté — c'est l'enregistrement de vos informations qui a échoué."
          : "Pour sauvegarder votre profil et débloquer la communauté, connectez-vous. Votre bilan sera lié à ce compte, quel que soit l'appareil utilisé."}
      </p>

      {saveError ? (
        <div className="mt-10 flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-danger">{saveError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="bg-gradient-accent mt-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Réessayer
          </button>
        </div>
      ) : saving ? (
        <div className="mt-10 flex flex-col items-center gap-3 py-10 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Enregistrement de votre profil…</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex justify-center">
            {mode === "sign-up" ? (
              <SignUp
                routing="hash"
                appearance={{ elements: { footer: "hidden" } }}
              />
            ) : (
              <SignIn
                routing="hash"
                appearance={{ elements: { footer: "hidden" } }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "sign-up" ? "sign-in" : "sign-up"))}
            className="mt-4 w-full text-center text-sm text-accent-strong underline underline-offset-2"
          >
            {mode === "sign-up"
              ? "Vous avez déjà un compte ? Se connecter"
              : "Pas encore de compte ? Créer un compte"}
          </button>
        </>
      )}

      {!saving && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-muted underline underline-offset-2"
        >
          Retour
        </button>
      )}
    </div>
  );
}
