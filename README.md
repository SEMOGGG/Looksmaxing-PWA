# Faciem

MVP visuel (frontend, données mock) d'une application de coaching
apparence & bien-être, en français.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- PWA : `public/manifest.json` + `public/sw.js`
- Prévu : Supabase (données), Clerk (auth + abonnements Stripe)

## Démarrer

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Structure

- `app/` — pages publiques (landing, onboarding) et `app/(app)/` — pages
  connectées (analyse, nutrition, skincare, compléments, compte), avec la
  barre de navigation mobile
- `components/` — briques d'interface partagées (header, footer, garde
  d'âge, barre de navigation mobile, icônes, disclaimer santé, logo)
- `components/onboarding/` — étapes du flux d'onboarding
- `lib/navigation.ts` — structure de navigation générale et texte du
  disclaimer santé
- `lib/onboarding.ts` — types et options du profil (sexe, activité, objectifs)
- `lib/profile-store.ts` — persistance du profil en `localStorage` (pas de
  backend dans ce MVP)
- `lib/nutrition.ts` — calcul BMR/TDEE (Mifflin-St Jeor) et macros
- `lib/analysis.ts` — génération du bilan mock à partir des objectifs choisis
- `scripts/generate-icons.mjs` — génère les icônes PWA (`npm run icons`)

## État d'avancement

- [x] Structure de navigation générale (header, footer, garde d'âge, barre
      de navigation mobile)
- [x] Landing page (présentation, vérification d'âge 18+, disclaimer)
- [x] Onboarding (upload photo + consentement RGPD, formulaire profil)
- [x] Résultats d'analyse (score global, points forts / axes de progression)
- [x] Plan nutritionnel (TDEE/BMR Mifflin-St Jeor, macros, pas quotidiens)
- [x] Routine skincare (matin / soir, étapes expliquées)
- [x] Compléments (liste + rappel professionnel de santé systématique)
- [x] Espace compte (historique, graphique de progression, abonnement)

Toutes les pages utilisent des données mock (aucun backend, aucun appel
réseau). Le profil renseigné à l'onboarding est conservé dans le
`localStorage` de l'appareil pour personnaliser les calculs ; en son
absence, un profil de démonstration est utilisé avec une bannière
explicite.
