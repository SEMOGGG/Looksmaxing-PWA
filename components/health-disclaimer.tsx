import { InfoIcon } from "@/components/icons";
import { HEALTH_DISCLAIMER } from "@/lib/navigation";

export function HealthDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-muted ${className}`}
      role="note"
    >
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <p>{HEALTH_DISCLAIMER}</p>
    </div>
  );
}
