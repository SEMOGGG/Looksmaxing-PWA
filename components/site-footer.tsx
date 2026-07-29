import Link from "next/link";
import { APP_NAME, HEALTH_DISCLAIMER, legalNav } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          {HEALTH_DISCLAIMER}
        </p>

        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Réservé aux personnes majeures.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
