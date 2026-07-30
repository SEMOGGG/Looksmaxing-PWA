import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_NAME } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo idPrefix="header-logo" className="h-8 w-8" />
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>
        </Link>

        <Link
          href="/onboarding"
          className="bg-gradient-accent rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Commencer
        </Link>
      </div>
    </header>
  );
}
