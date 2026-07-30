"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { StepConsentPhoto } from "@/components/onboarding/step-consent-photo";
import { StepProfile } from "@/components/onboarding/step-profile";
import { StepActivity } from "@/components/onboarding/step-activity";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepSummary } from "@/components/onboarding/step-summary";
import { StepAccount } from "@/components/onboarding/step-account";
import { initialOnboardingData, type OnboardingData } from "@/lib/onboarding";
import { saveUserProfile } from "@/app/actions/user-data";
import { loadDraft, saveDraft, clearDraft } from "@/lib/onboarding-draft";

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // L'étape de création de compte peut déclencher un rechargement de page
  // (synchronisation de session Clerk) : on restaure la progression déjà
  // saisie si elle a été interrompue par ce rechargement.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step);
      setData(draft.data);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDraft(step, data);
  }, [step, data, hydrated]);

  function update(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  // Dès que la dernière étape est atteinte et qu'un compte est actif
  // (nouvellement créé ou déjà existant), on enregistre le profil et on
  // continue — le composant StepAccount se charge seulement de proposer la
  // connexion, pas d'en dépendre.
  useEffect(() => {
    if (step !== TOTAL_STEPS || !isLoaded || !isSignedIn || saving) return;
    setSaving(true);
    saveUserProfile(data).then(() => {
      clearDraft();
      router.push("/analyse");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isLoaded, isSignedIn]);

  function goNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0 });
  }

  const isStepValid = {
    1: true,
    2: Boolean(data.age && data.sex && data.heightCm && data.weightKg),
    3: Boolean(data.activityLevel),
    4: data.goals.length > 0,
    5: true,
    6: true,
  }[step];

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader step={step} totalSteps={TOTAL_STEPS} />

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        {step === 1 && <StepConsentPhoto data={data} update={update} />}
        {step === 2 && <StepProfile data={data} update={update} />}
        {step === 3 && <StepActivity data={data} update={update} />}
        {step === 4 && <StepGoals data={data} update={update} />}
        {step === 5 && <StepSummary data={data} />}
        {step === 6 && <StepAccount saving={saving} onBack={goBack} />}
      </main>

      {step < TOTAL_STEPS && (
        <StepActions
          onBack={goBack}
          onNext={goNext}
          nextDisabled={!isStepValid}
          showBack={step > 1}
          nextLabel={step === TOTAL_STEPS - 1 ? "Créer mon compte" : "Continuer"}
        />
      )}
    </div>
  );
}
