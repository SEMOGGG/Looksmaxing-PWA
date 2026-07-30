import { clerkMiddleware } from "@clerk/nextjs/server";

// Toute l'application reste accessible sans compte (profil et plan restent
// gérés en local pour l'instant) : ce middleware active seulement le
// contexte d'authentification Clerk, sans forcer de connexion. Seule la
// publication dans la Communauté exige d'être connecté, vérifié directement
// dans les Server Actions concernées.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js|json|ico|png|jpg|jpeg|svg|webp|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
};
