import Link from "next/link";
import { InfoIcon } from "@/components/icons";

export function DemoProfileBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-foreground">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
      <p>
        Vous voyez un exemple de démonstration.{" "}
        <Link href="/onboarding" className="font-medium text-accent-strong underline underline-offset-2">
          Complétez votre profil
        </Link>{" "}
        pour un résultat personnalisé.
      </p>
    </div>
  );
}
