# Faciem

MVP d'une application de coaching apparence & bien-être, en français.
Frontend Next.js avec données mock, plus un premier backend réel (Clerk +
Supabase) pour l'espace Communauté.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- Clerk — authentification (utilisée pour la Communauté)
- Supabase — stockage des publications/commentaires de la Communauté
- PWA : `public/manifest.json` + `public/sw.js`
- Prévu : Stripe (abonnement Premium réel — structure visuelle seulement
  pour l'instant)

## Démarrer

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env.local` (jamais commité) avec :

```
SUPABASE_URL=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Les mêmes 4 variables doivent aussi être ajoutées dans les paramètres du
projet Vercel (Production **et** Preview) pour que le déploiement fonctionne.

Avant la première utilisation de la Communauté, exécuter le contenu de
`supabase/schema.sql` dans l'éditeur SQL du projet Supabase (tables posts/
commentaires/likes/signalements + policies RLS). Les publications de
démonstration sont ensuite insérées automatiquement au premier chargement
si la table est vide (voir `seedIfEmpty` dans
`app/(app)/communaute/actions.ts`).

## Structure

- `app/` — pages publiques (landing, onboarding, mentions légales,
  confidentialité, conditions) et `app/(app)/` — pages connectées (analyse,
  nutrition, communauté, routine, compte), avec la barre de navigation
  mobile
- `app/(app)/communaute/actions.ts` — Server Actions (lecture/écriture
  Supabase, vérification Clerk, modération)
- `components/` — briques d'interface partagées (header, footer, garde
  d'âge, barre de navigation mobile, icônes, disclaimer santé, logo)
- `components/onboarding/` et `components/community/` — composants propres
  à ces deux parcours
- `lib/navigation.ts` — structure de navigation générale et texte du
  disclaimer santé
- `lib/onboarding.ts` — types et options du profil (sexe, activité, objectifs)
- `lib/profile-store.ts` / `lib/subscription-store.ts` — profil et statut
  d'abonnement (mock) en `localStorage`
- `lib/nutrition.ts` — calcul BMR/TDEE (Mifflin-St Jeor) et macros
- `lib/analysis.ts` — génération du bilan mock à partir des objectifs choisis
- `lib/hair.ts` — formes de visage et recommandations coupe/barbe
- `lib/community.ts` — contenu éditorial, types et modération (partagé
  client/serveur — aucun accès Supabase ici)
- `lib/supabase/server.ts` — client Supabase serveur uniquement
- `supabase/schema.sql` — schéma de la base (tables + RLS + triggers)
- `scripts/generate-icons.mjs` — génère les icônes PWA (`npm run icons`)

## État d'avancement

- [x] Structure de navigation générale, landing, onboarding, analyse,
      nutrition, routine (skincare/cheveux & barbe/compléments), compte
- [x] Communauté : articles éditoriaux + fil de discussion, publication
      réservée au Premium, modération par mots-clés (à remplacer par un
      vrai modèle de modération IA), backend réel Clerk + Supabase
- [x] Mentions légales, confidentialité, conditions d'utilisation
- [ ] Abonnement Premium réel (Stripe) — structure visuelle seulement,
      le statut Premium reste un mock en localStorage
- [ ] Vraie modération IA (actuellement liste de mots-clés)

Le profil (âge, taille, poids, objectifs…) et le statut d'abonnement
restent en `localStorage` pour l'instant. Seule la Communauté utilise un
vrai backend partagé (Clerk pour l'identité, Supabase pour les données).
