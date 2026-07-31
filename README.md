# Faciem

MVP d'une application de coaching apparence & bien-être, en français.
Frontend Next.js avec un vrai backend (Clerk + Supabase) : profil, statut
d'abonnement et espace Communauté sont liés à un compte, pas à un appareil.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- Clerk — authentification (compte créé en fin d'onboarding)
- Supabase — profil utilisateur, poids, publications/commentaires de la
  Communauté, historique du Coach IA, analyses corporelles/peau par photo
- Claude (Anthropic) — Coach IA (Haiku, avec outil de recherche
  nutritionnelle USDA) et analyses par photo (Sonnet), réservés au Premium
- USDA FoodData Central (API publique gratuite) — valeurs nutritionnelles
  réelles pour les questions du Coach IA sur la composition des aliments
- PWA : `public/manifest.json` + `public/sw.js`
- Prévu : Stripe (abonnement Premium réel — structure visuelle seulement
  pour l'instant, le champ `plan` existe déjà côté Supabase)

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
ANTHROPIC_API_KEY=
USDA_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

`USDA_API_KEY` est optionnelle (clé gratuite sur
https://fdc.nal.usda.gov/api-key-signup) ; à défaut, le Coach IA utilise
`DEMO_KEY`, partagée et limitée en nombre de requêtes/heure — suffisant
pour tester, mais une clé personnelle est recommandée en production.

`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` sont optionnelles
(compte gratuit sur https://upstash.com) : elles activent le rate limiting
sur le Coach IA, les analyses par photo, les publications communauté et la
sauvegarde de profil (voir `lib/rate-limit.ts`). Sans elles, ces routes
restent fonctionnelles mais sans limite de fréquence.

Les autres variables doivent être ajoutées dans les paramètres du projet
Vercel (Production **et** Preview) pour que le déploiement fonctionne.

Avant la première utilisation, exécuter le contenu de `supabase/schema.sql`
dans l'éditeur SQL du projet Supabase : tables Communauté (posts/
commentaires/likes/signalements), `user_profiles` (profil + abonnement +
forme de visage), `coach_messages` (historique du Coach IA, avec tokens
facturés pour le budget mensuel), `weight_entries` (suivi de poids),
`body_analyses` et `skin_analyses` (estimations par photo), avec policies
RLS. Les publications de démonstration de la Communauté sont insérées
automatiquement au premier chargement si la table est vide (voir
`seedIfEmpty` dans `app/(app)/communaute/actions.ts`).

Le Coach IA (`/coach`, Premium) utilise Claude Haiku avec un outil de
recherche nutritionnelle (USDA FoodData Central) et un garde-fou de 200
messages/jour par membre. Les analyses par photo (composition corporelle,
peau) utilisent Claude Sonnet, sans limite de nombre par jour. Le vrai
plafond de coût est un **budget mensuel réel de 2,50$ par membre, partagé
entre le Coach IA et les analyses par photo**, calculé sur les tokens
effectivement facturés par l'API (voir `getMonthlyAiCostUsd` dans
`lib/ai-usage.ts`) — un nombre de messages ou d'analyses par jour ne
suffit pas à garantir un plafond en euros, donc le budget se base sur
l'usage facturé, pas sur un simple comptage.

## Structure

- `app/` — pages publiques (landing, onboarding, mentions légales,
  confidentialité, conditions) et `app/(app)/` — pages connectées (analyse,
  nutrition, communauté, routine, compte), avec la barre de navigation
  mobile
- `app/actions/user-data.ts` — Server Actions du profil utilisateur
  (lecture/écriture Supabase, vérification Clerk) : `getUserData`,
  `saveUserProfile`, `saveUserPlan`, `saveFaceShapeData`
- `app/actions/bilan.ts` — bilan Analyse (score + catégories) généré par
  Claude vision à partir de la photo de profil : 1/mois gratuit, illimité
  Premium (dans le budget partagé) ; retombe sur le bilan mock
  (`lib/analysis.ts`) si la personne n'a pas de photo
- `app/(app)/communaute/actions.ts` — Server Actions de la Communauté
  (lecture/écriture Supabase, vérification Clerk, modération)
- `app/actions/coach.ts` — Server Actions du Coach IA (vérification Premium,
  quota quotidien, budget mensuel, boucle d'outils, appel à l'API Claude,
  persistance de l'historique)
- `lib/ai-usage.ts` — budget mensuel réel partagé entre le Coach IA et les
  analyses par photo, calculé sur les tokens facturés par l'API
- `app/actions/weight.ts` — Server Actions du suivi de poids
- `app/actions/body-analysis.ts` / `app/actions/skin-analysis.ts` —
  Server Actions des estimations par photo (Premium, encadrées par le
  budget mensuel partagé, photo jamais conservée)
- `lib/food-data.ts` — recherche de valeurs nutritionnelles réelles via
  l'API USDA FoodData Central (outil du Coach IA)
- `lib/validation.ts` — schémas Zod utilisés par toutes les Server Actions
  qui écrivent des données (défense en profondeur : une Server Action est
  un endpoint appelable directement, pas seulement depuis l'UI)
- `lib/rate-limit.ts` — rate limiting optionnel (Upstash Redis) sur les
  routes sensibles ; no-op si non configuré
- `app/actions/delete-account.ts` — suppression de compte en cascade
  (toutes les tables Supabase liées + compte Clerk), accessible depuis la
  page Compte
- `lib/skincare.ts` — routines (matin/soir/gua sha) et bibliothèque
  d'ingrédients skincare
- `components/` — briques d'interface partagées (header, footer, garde
  d'âge, barre de navigation mobile, icônes, disclaimer santé, logo)
- `components/onboarding/` et `components/community/` — composants propres
  à ces deux parcours ; `step-account.tsx` embarque Clerk `<SignUp>`/
  `<SignIn>` comme dernière étape de l'onboarding
- `lib/navigation.ts` — structure de navigation générale et texte du
  disclaimer santé
- `lib/onboarding.ts` — types et options du profil (sexe, activité, objectifs)
- `lib/user-data.ts` — type `Plan`, partagé entre Server Actions et pages
- `lib/nutrition.ts` — calcul BMR/TDEE (Mifflin-St Jeor) et macros
- `lib/analysis.ts` — bilan mock (fallback quand la personne n'a pas de
  photo), à partir des objectifs choisis
- `lib/hair.ts` — formes de visage et recommandations coupe/barbe
- `lib/community.ts` — contenu éditorial, types et modération (partagé
  client/serveur — aucun accès Supabase ici)
- `lib/coach.ts` — type des messages, réglages de coût (modèle, quota,
  fenêtre de contexte) et prompt système du Coach IA
- `lib/supabase/server.ts` — client Supabase serveur uniquement
- `supabase/schema.sql` — schéma de la base (tables + RLS + triggers)
- `scripts/generate-icons.mjs` — génère les icônes PWA (`npm run icons`)

## État d'avancement

- [x] Structure de navigation générale, landing, onboarding (6 étapes,
      compte Clerk requis en dernière étape), analyse, nutrition, routine
      (skincare/cheveux & barbe/compléments), compte
- [x] Profil, statut d'abonnement et forme de visage stockés dans Supabase
      (table `user_profiles`), liés au compte Clerk — plus de localStorage
- [x] Communauté : articles éditoriaux + fil de discussion, publication
      réservée au Premium, modération par mots-clés (à remplacer par un
      vrai modèle de modération IA), backend réel Clerk + Supabase
- [x] Mentions légales, confidentialité, conditions d'utilisation
- [x] Bilan Analyse (score + points forts/axes de progression) généré par
      Claude vision à partir de la photo de profil — 1/mois gratuit,
      illimité Premium ; bilan mock en repli si pas de photo
- [x] Coach IA (Premium) : chat avec Claude Haiku + recherche nutritionnelle
      réelle (USDA), garde-fous santé/sécurité, programmes d'entraînement
      personnalisés, conseils produits — budget mensuel réel par membre
- [x] Nutrition : suivi de poids (graphique), repères sodium/potassium et
      hydratation personnalisée, estimation de composition corporelle par
      photo (Premium, estimation visuelle avec disclaimers, pas une mesure
      clinique)
- [x] Skincare : routine gua sha, bibliothèque d'ingrédients (niacinamide,
      rétinol, céramides, SPF...), analyse de peau par IA (Premium)
- [x] Audit de sécurité : validation Zod sur toutes les Server Actions
      mutantes, rate limiting optionnel (Upstash), headers HTTP (CSP,
      HSTS, X-Frame-Options...), suppression de compte en cascade (RGPD)
- [ ] Abonnement Premium réel (Stripe) — le changement de plan sur la page
      Compte est encore un bouton libre, sans paiement
- [ ] Vraie modération IA de la Communauté (actuellement liste de mots-clés)
- [ ] Galerie d'images de coupes/styles via une banque d'images sous licence

Un compte est désormais nécessaire pour terminer l'onboarding et accéder
au bilan personnalisé ; sans compte, les pages affichent un profil de
démonstration avec un bandeau invitant à compléter l'onboarding.
