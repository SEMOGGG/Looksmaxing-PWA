"use client";

import { useEffect, useState } from "react";
import { getUserData } from "@/app/actions/user-data";

// Rappel visuel persistant du plan actif, affiché dans l'en-tête de chaque
// page connectée — pour que le passage en Premium se voie partout, pas
// seulement sur la page Abonnement.
export function PlanBadge() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    getUserData().then(({ plan }) => setIsPremium(plan === "premium"));
  }, []);

  if (!isPremium) return null;

  return (
    <span className="bg-gradient-accent rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
      Premium
    </span>
  );
}
