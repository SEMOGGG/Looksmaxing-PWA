"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";

export function StepAccount({ saving, onBack }: { saving: boolean; onBack: () => void }) {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Créez votre compte
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Pour sauvegarder votre profil et débloquer la communauté, connectez-vous.
        Votre bilan sera lié à ce compte, quel que soit l&rsquo;appareil utilisé.
      </p>

      {saving ? (
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
