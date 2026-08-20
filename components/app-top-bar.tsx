import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { PlanBadge } from "@/components/plan-badge";

export function AppTopBar({
  title,
  idPrefix,
  end,
}: {
  title: string;
  idPrefix: string;
  end?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-5 py-4">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="rounded-full transition-transform hover:scale-110 active:scale-95"
        >
          <Logo idPrefix={idPrefix} className="h-7 w-7" />
        </Link>
        <h1 className="font-heading flex-1 text-lg font-semibold text-foreground">{title}</h1>
        {end}
        <PlanBadge />
      </div>
    </header>
  );
}
