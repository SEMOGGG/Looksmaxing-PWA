import Link from "next/link";
import { AppTopBar } from "@/components/app-top-bar";
import { NavIcon, ArrowRightIcon } from "@/components/icons";
import { routineNav } from "@/lib/navigation";

export default function RoutinePage() {
  return (
    <>
      <AppTopBar title="Routine" idPrefix="routine-logo" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <p className="text-sm leading-relaxed text-muted">
          Tout ce qui prend soin de votre apparence au quotidien, en un seul endroit.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {routineNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                <NavIcon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-foreground">
                  {item.label}
                </span>
                <span className="block text-sm text-muted">{item.description}</span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
