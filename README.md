# Faciem

MVP d'une application de coaching apparence & bien-être, en français.
Frontend Next.js avec un vrai backend (Clerk + Supabase) : profil, statut
d'abonnement et espace Communauté sont liés à un compte, pas à un appareil.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4
- Clerk — authentification (compte créé en fin d'onboarding)
- Supabase — profil utilisateur + publications/commentaires de la Communauté
  + historique du Coach IA
- Claude (Anthropic, modèle Haiku) — Coach IA, réservé au Premium
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
```

Les mêmes 5 variables doivent aussi être ajoutées dans les paramètres du
projet Vercel (Production **et** Preview) pour que le déploiement fonctionne.

Avant la première utilisation, exécuter le contenu de `supabase/schema.sql`
dans l'éditeur SQL du projet Supabase : tables Communauté (posts/
commentaires/likes/signalements), `user_profiles` (profil + abonnement +
forme de visage, une ligne par compte Clerk) et `coach_messages`
(historique du Coach IA), avec policies RLS. Les publications de
démonstration de la Communauté sont insérées automatiquement au premier
chargement si la table est vide (voir `seedIfEmpty` dans
`app/(app)/communaute/actions.ts`).

Le Coach IA (`/coach`) est réservé au Premium et plafonné à 30 messages
par jour et par membre (voir `lib/coach.ts`) pour garder les coûts sous
contrôle ; il utilise Claude Haiku (le modèle le plus économique de la
gamme), avec des réponses courtes et un contexte de conversation borné.

## Structure

- `app/` — pages publiques (landing, onboarding, mentions légales,
  confidentialité, conditions) et `app/(app)/` — pages connectées (analyse,
  nutrition, communauté, routine, compte), avec la barre de navigation
  mobile
- `app/actions/user-data.ts` — Server Actions du profil utilisateur
  (lecture/écriture Supabase, vérification Clerk) : `getUserData`,
  `saveUserProfile`, `saveUserPlan`, `saveFaceShapeData`
- `app/(app)/communaute/actions.ts` — Server Actions de la Communauté
  (lecture/écriture Supabase, vérification Clerk, modération)
- `app/actions/coach.ts` — Server Actions du Coach IA (vérification Premium,
  quota quotidien, appel à l'API Claude, persistance de l'historique)
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
- `lib/analysis.ts` — génération du bilan mock à partir des objectifs choisis
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
- [x] Coach IA (Premium) : chat avec Claude Haiku, garde-fous santé/sécurité
      dans le prompt système, quota quotidien pour maîtriser les coûts
- [ ] Abonnement Premium réel (Stripe) — le changement de plan sur la page
      Compte est encore un bouton libre, sans paiement
- [ ] Vraie modération IA de la Communauté (actuellement liste de mots-clés)
- [ ] Galerie d'images de coupes/styles via une banque d'images sous licence

Un compte est désormais nécessaire pour terminer l'onboarding et accéder
au bilan personnalisé ; sans compte, les pages affichent un profil de
démonstration avec un bandeau invitant à compléter l'onboarding.
