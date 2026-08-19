"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Point d'entrée dédié pour un utilisateur qui a déjà un compte : contrairement
// à l'étape 6 de l'onboarding, cette page ne redéclenche jamais
// `saveUserProfile` — se connecter ici ne touche jamais au profil déjà
// enregistré.
export default function ConnexionPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/analyse");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-5 py-12">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Bon retour
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted">
          Connectez-vous pour retrouver votre profil, votre bilan et votre historique.
        </p>

        <div className="mt-6 flex justify-center">
          <SignIn routing="hash" appearance={{ elements: { footer: "hidden" } }} />
        </div>

        <Link
          href="/onboarding"
          className="mt-4 text-sm text-accent-strong underline underline-offset-2"
        >
          Pas encore de compte ? Créer un compte
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
