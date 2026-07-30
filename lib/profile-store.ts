import type { OnboardingData } from "@/lib/onboarding";

// Pas de backend pour ce MVP : le profil issu de l'onboarding est conservé
// dans le localStorage de l'appareil, et relu par les pages analyse/
// nutrition/compte pour personnaliser leurs calculs.
const STORAGE_KEY = "faciem_profile";

export function saveProfile(data: OnboardingData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // stockage indisponible (navigation privée, quota) : on ignore silencieusement
  }
}

export function loadProfile(): OnboardingData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}
