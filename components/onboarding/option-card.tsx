import { CheckIcon } from "@/components/icons";

export function OptionCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selected
          ? "border-accent bg-accent-soft"
          : "border-border bg-surface hover:border-accent/40"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={`bg-gradient-accent flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-opacity ${
          selected ? "opacity-100" : "opacity-0"
        }`}
      >
        <CheckIcon className="h-3 w-3 text-white" />
      </span>
    </button>
  );
}
