"use client";

import { LockIcon } from "@/components/icons";
import { PhotoSlot } from "@/components/photo-slot";
import type { OnboardingData } from "@/lib/onboarding";

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
          disabledHint="Cochez la case ci-dessus pour activer l'envoi"
          required
          capture="user"
          value={data.photoDataUrl}
          disabled={!data.consentGiven}
          onChange={(v) => update({ photoDataUrl: v })}
        />
        <PhotoSlot
          label="Photo de profil"
          hint="Visage de côté"
          disabledHint="Cochez la case ci-dessus pour activer l'envoi"
          required
          capture="user"
          value={data.photoProfileDataUrl}
          disabled={!data.consentGiven}
          onChange={(v) => update({ photoProfileDataUrl: v })}
        />
        <PhotoSlot
          label="Photo de corps"
          hint="Torse dégagé, pour une analyse plus poussée (posture, tonus, composition)"
          disabledHint="Cochez la case ci-dessus pour activer l'envoi"
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
