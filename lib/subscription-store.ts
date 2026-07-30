// Pas de Stripe fonctionnel dans ce MVP : le plan choisi est simulé en
// localStorage pour pouvoir visualiser l'expérience Premium sans paiement.
export type Plan = "free" | "premium";

const STORAGE_KEY = "faciem_plan";

export function loadPlan(): Plan {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "premium" ? "premium" : "free";
  } catch {
    return "free";
  }
}

export function savePlan(plan: Plan) {
  try {
    window.localStorage.setItem(STORAGE_KEY, plan);
  } catch {
    // stockage indisponible : on ignore silencieusement
  }
}
