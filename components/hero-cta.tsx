"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRightIcon } from "@/components/icons";

// Personnalise le CTA du hero selon l'état de connexion — un visiteur non
// connecté voit "Commencer" (onboarding), une personne déjà connectée voit
// directement un accès à son espace plutôt que de repasser par l'onboarding.
export function HeroCta() {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div className="mt-8 h-[52px]" aria-hidden />;
  }

  if (isSignedIn) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
        <Link
          href="/analyse"
          className="glow bg-gradient-accent inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto"
        >
          Retrouver mon espace
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <span className="text-xs text-muted">
          Content de vous revoir{user?.firstName ? `, ${user.firstName}` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
      <Link
        href="/onboarding"
        className="glow bg-gradient-accent inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] sm:w-auto"
      >
        Commencer
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
      <span className="text-xs text-muted">
        Gratuit pour commencer · réservé aux 18 ans et plus
      </span>
    </div>
  );
}

// CTA de la section finale — même logique, présentation adaptée au fond
// dégradé (pilule blanche) de cette section.
export function FinalCta() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="mt-7 h-[52px]" aria-hidden />;
  }

  if (isSignedIn) {
    return (
      <Link
        href="/analyse"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02]"
      >
        Retrouver mon espace
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link
      href="/onboarding"
      className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0a0a0f] transition-transform hover:scale-[1.02]"
    >
      Commencer gratuitement
      <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );
}
