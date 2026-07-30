import Link from "next/link";
import { Logo } from "@/components/logo";

export function OnboardingHeader({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Retour à l'accueil">
          <Logo idPrefix="onboarding-logo" className="h-7 w-7" />
        </Link>
        <span className="text-xs font-medium text-muted">
          Étape {step} / {totalSteps}
        </span>
      </div>
      <div className="h-1 w-full bg-surface-muted">
        <div
          className="bg-gradient-accent h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
