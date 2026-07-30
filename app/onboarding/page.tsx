"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { StepConsentPhoto } from "@/components/onboarding/step-consent-photo";
import { StepProfile } from "@/components/onboarding/step-profile";
import { StepActivity } from "@/components/onboarding/step-activity";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepSummary } from "@/components/onboarding/step-summary";
import { initialOnboardingData, type OnboardingData } from "@/lib/onboarding";
import { saveProfile } from "@/lib/profile-store";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  function update(patch: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    } else {
      saveProfile(data);
      router.push("/analyse");
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
  }[step];

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader step={step} totalSteps={TOTAL_STEPS} />

      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
        {step === 1 && <StepConsentPhoto data={data} update={update} />}
        {step === 2 && <StepProfile data={data} update={update} />}
        {step === 3 && <StepActivity data={data} update={update} />}
        {step === 4 && <StepGoals data={data} update={update} />}
        {step === 5 && <StepSummary data={data} />}
      </main>

      <StepActions
        onBack={goBack}
        onNext={goNext}
        nextDisabled={!isStepValid}
        showBack={step > 1}
        nextLabel={step === TOTAL_STEPS ? "Voir mon bilan" : "Continuer"}
      />
    </div>
  );
}
