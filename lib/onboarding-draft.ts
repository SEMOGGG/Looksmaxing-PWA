import type { OnboardingData } from "@/lib/onboarding";

// L'étape finale de l'onboarding (création de compte) déclenche un
// rechargement de page côté Clerk (synchronisation de session pour un
// navigateur qui n'a encore jamais parlé à Clerk). Le brouillon de
// l'onboarding est donc sauvegardé en sessionStorage à chaque étape, pour
// que ce rechargement ne fasse pas perdre la progression déjà saisie.
const DRAFT_KEY = "faciem_onboarding_draft";

type Draft = { step: number; data: OnboardingData };

export function loadDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(step: number, data: OnboardingData) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
  } catch {
    // stockage indisponible : on ignore silencieusement
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // stockage indisponible : on ignore silencieusement
  }
}
