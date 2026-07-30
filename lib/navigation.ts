// Structure de navigation générale de l'application.
// Utilisée par le header marketing et par la barre de navigation
// mobile (app connectée), au fur et à mesure que les pages sont créées.

export type NavItem = {
  label: string;
  href: string;
  icon: "home" | "sparkles" | "leaf" | "droplet" | "pill" | "user" | "users" | "grid";
  description: string;
};

export const APP_NAME = "Faciem";

export const APP_TAGLINE = "Le meilleur de vous-même, à votre rythme";

export const primaryNav: NavItem[] = [
  {
    label: "Analyse",
    href: "/analyse",
    icon: "sparkles",
    description: "Vos résultats et votre progression",
  },
  {
    label: "Nutrition",
    href: "/nutrition",
    icon: "leaf",
    description: "Plan nutritionnel personnalisé",
  },
  {
    label: "Communauté",
    href: "/communaute",
    icon: "users",
    description: "Articles et entraide entre membres",
  },
  {
    label: "Routine",
    href: "/routine",
    icon: "grid",
    description: "Skincare, cheveux & barbe, compléments",
  },
  {
    label: "Compte",
    href: "/compte",
    icon: "user",
    description: "Historique et abonnement",
  },
];

// Sous-pages regroupées sous le hub "Routine" (plus dans la barre de
// navigation principale, gardent leurs routes existantes).
export const routineNav = [
  {
    label: "Skincare",
    href: "/skincare",
    icon: "droplet" as const,
    description: "Routine peau matin et soir",
  },
  {
    label: "Cheveux & barbe",
    href: "/cheveux-barbe",
    icon: "scissors" as const,
    description: "Forme de visage, coupe et taille de barbe",
  },
  {
    label: "Compléments",
    href: "/complements",
    icon: "pill" as const,
    description: "Compléments courants et repères",
  },
];

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions" },
];

export const HEALTH_DISCLAIMER =
  "Ces informations sont fournies à titre indicatif et ne remplacent pas l'avis d'un professionnel de santé.";
