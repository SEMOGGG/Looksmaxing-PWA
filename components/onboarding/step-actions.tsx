import { ArrowRightIcon } from "@/components/icons";

export function StepActions({
  onBack,
  onNext,
  nextLabel = "Continuer",
  nextDisabled = false,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-5 py-4">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50"
          >
            Retour
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="bg-gradient-accent flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:opacity-90"
        >
          {nextLabel}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
