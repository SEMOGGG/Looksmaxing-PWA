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

- `app/` — pages (App Router)
- `components/` — briques d'interface partagées (header, footer, garde d'âge,
  barre de navigation mobile, icônes, disclaimer santé)
- `lib/navigation.ts` — structure de navigation générale de l'app et texte du
  disclaimer santé, réutilisés dans plusieurs pages
- `scripts/generate-icons.mjs` — génère les icônes PWA (`npm run icons`)

## État d'avancement

- [x] Structure de navigation générale (header, footer, garde d'âge, config
      de nav pour la barre mobile à venir)
- [x] Landing page (présentation, vérification d'âge 18+, disclaimer)
- [x] Onboarding (upload photo + consentement RGPD, formulaire profil)
- [ ] Résultats d'analyse
- [ ] Plan nutritionnel (TDEE, macros, activité)
- [ ] Routine skincare
- [ ] Compléments
- [ ] Espace compte (historique, progression, abonnement)
