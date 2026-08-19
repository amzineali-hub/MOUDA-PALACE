# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mouda Palace SaaS — a private, single-restaurant management system (Fès, Morocco): reservations, B2B/riad partner portal, digital menu, inventory, POS, kitchen display, accounting, HR, and AI-assisted content tools. Despite `ARCHITECTURE.md`'s multi-tenant description, the deployed app is **single-tenant**: only three hardcoded email addresses can ever authenticate (see Access Control below).

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the local dev server (Express + Vite middleware, `server.ts`) at `http://localhost:3000`
- `npm run build` — build the client (`vite build`) and bundle the server (`esbuild server.ts` → `dist/server.cjs`)
- `npm start` — run the production build (`node dist/server.cjs`)
- `npm run lint` — typecheck only (`tsc --noEmit`); there is no separate linter configured
- `npm test` — run all tests once (`vitest run`)
- `npx vitest run src/lib/inventory.test.ts` — run a single test file
- `npx vitest run -t "test name"` — run tests matching a name pattern

Note: CI (`.github/workflows/deploy.yml`) runs `npm run lint` but has the `npm run test` step commented out, so Vitest is not currently enforced on push — run it manually before relying on it.

## Architecture

**Monolithic root component.** `src/App.tsx` (~6,800 lines) owns almost everything: Firebase auth/session state, the Google sign-in gate, Firestore listeners for shared data (reservations, partners, notifications, etc.), and top-level routing. There is no router library — navigation is a `activeTab` string state variable and a big `switch` in `renderContent()` that maps tab names to feature components. Full-screen "kiosk" tabs (`kds`, `finance`, `tables`, `device_simulator`) also trigger `requestFullscreen()`.

**Feature modules as lazy top-level files.** Each major feature lives in its own file directly under `src/` (not a subfolder) — e.g. `Accounting.tsx`, `MenuGenerator.tsx`, `POSTactile.tsx`, `EcranCuisine.tsx`, `Inventory.tsx`, `RH.tsx`, `GestionTables.tsx`, `TableauDeBord.tsx`. Most are `React.lazy`-loaded from `App.tsx` and receive `setActiveTab` as a prop to navigate back into the shell. Small reusable UI pieces (scanner, combobox, modals, planning widgets) live in `src/components/`.

**Pure business logic is isolated in `src/lib/`.** Pricing, TVA, recipe costing, inventory thresholds, payroll, and supplier rating calculations are extracted as plain functions (`inventory.ts`, `inventoryUtils.ts`, `priceUtils.ts`, `recipeCost.ts`, `payroll.ts`, `revenueUtils.ts`, `supplierRating.ts`, `tva.ts`), each with a colocated `*.test.ts` Vitest file. This is the primary place with real test coverage — UI components are not tested.

**Firebase is a single client-side singleton.** `src/firebase.ts` initializes app/auth/firestore/storage once from `firebase-applet-config.json` (checked into the repo — it's a public web API key, safe to expose per Firebase's model) and exports them directly; feature components import `db`/`auth`/`storage` from there rather than receiving them via context. Firestore is opened with multi-tab IndexedDB persistence.

**Access control is a hardcoded allowlist, duplicated in two places that must stay in sync:**
- `src/context/AuthContext.tsx` — `AUTHORIZED_EMAILS` (client-side gate: any other Google account is force-signed-out on auth state change, before any `users` doc is created)
- `firestore.rules` — the same three emails, required for `email_verified`

`OWNER_EMAIL` in `AuthContext.tsx` gates a further-restricted subset of views (e.g. connection history) beyond the general authorized staff.

**AI/serverless endpoints live in `api/`** (Vercel functions: `translate-menu.js`, `analyze-review.js`, `generate-blog.js`, `proxy-document.ts`), calling `@google/genai` (Gemini) server-side with `GEMINI_API_KEY`. `proxy-document.ts` is a generic fetch-and-relay proxy for pulling external documents (e.g. for the flipbook/menu viewer) around CORS.

**Two parallel serving paths exist:**
- `server.ts` — an Express server used for local dev (wraps Vite middleware) and for the built production artifact (`dist/server.cjs`, serves `dist/` and falls back to `index.html`); this is the path used when deployed as a Cloud Run-style Node service.
- `vercel.json` — rewrites `/api/*` to the `api/` serverless functions and everything else to `index.html`, for a Vercel-style static+functions deployment.

Both paths must keep working since the deploy target isn't fixed in this repo.

**Deployment**: `.github/workflows/deploy.yml` runs on push to `main`/`staging`, builds the app, and deploys **only Firestore rules** to the Firebase project `clever-datum-pjlsj` (via `firebase.json` → `firestore.rules`) — it does not deploy hosting from this pipeline.

**Templates**: `templates/rh/*.docx` and `templates/carte-groupes/*.docx` are source Word documents (contracts, HR notices, multilingual group menus) that are read/manipulated by the app (e.g. via `mammoth`) rather than hardcoded UI content.

## Styling

Tailwind CSS v4, configured CSS-first via `@theme` in `src/index.css` (fonts, custom `scan` animation) plus the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`.

## Backlog

`BACKLOG.md` (racine du repo) liste ce qui reste à faire, par module — à consulter en début de session et à tenir à jour au fil des traitements (chaque heure/jour de travail sur l'ERP), pas seulement en fin de tâche.

## Historique récent

- **3 modules retirés du produit** : Zones et Économat, HACCP et Sous-Vide, Chambre Négative. Décision produit déjà prise et appliquée — ne pas les recréer sans consigne explicite de l'utilisateur.
- **Faille de sécurité corrigée** : `firestore.rules` autorisait auparavant `allow read, write: if true` (accès public total). Corrigé — les règles actuelles restreignent l'accès aux emails de `AUTHORIZED_EMAILS` (voir Access Control ci-dessus). Ne jamais réintroduire une règle ouverte.
- **Mise en production** : l'ERP est en production depuis ce mois-ci. Seul le rôle `manager` est actuellement activé ; les autres rôles seront ouverts progressivement. Tenir compte de cet état en production lors de changements touchant l'auth, les rôles ou les permissions.

### Résumé de la semaine (7 derniers jours)

- **Sécurité & accès** : verrouillage de Firestore/admin aux comptes autorisés, correction du projet Firebase ciblé par le CI, passage à `signInWithRedirect` sur mobile (les popups échouaient), journalisation des connexions réussies avec historique visible par le seul propriétaire.
- **Revue experte ERP (2 phases)** : correction de bugs silencieux, écritures atomiques, piste d'audit, cycle de vie des commandes, mutualisation des calculs, découpage du code (code splitting).
- **Module Flipbook** : nouveau catalogue de plats en pages tournantes, puis plusieurs corrections (taille fixe pour arrêter le redimensionnement/jitter, livre qui se réinitialisait à chaque snapshot Firestore, centrage de la couverture/dos, agrandissement pour remplir le viewport).
- **Générateur de menu (impression)** : corrections des templates imprimables (logo cassé, couleurs d'en-tête alignées sur le vert/sarcelle réel de l'ERP, en-tête du menu traditionnel aligné sur le moderne).
- **RH** : suivi des absences (jour complet et heures partielles) avec déduction salariale au prorata, correction d'un bulletin de paie généré avec un nom d'employé vide, nouvel onglet Documents RH (congés, modèles légaux téléchargeables), pointage manuel, avance/carte sanitaire, suppression dans l'historique de paie.
- **Comptabilité** : numérotation séquentielle des factures, en-tête/logo réels de l'entreprise, en-tête de facture unifié, modèles de menu de groupe éditables, détail HT/TVA/TTC dans Dépenses & Achats, édition/suppression de factures.
- **Stocks & inventaire** : fusion des modales de mouvement de stock dupliquées, ajout prix/TVA, seuil de stock minimum éditable en ligne, alerte stock minimum, suppression du tableau de tâches Production Journalière (redondant), ajout puis retrait de la zone de stockage Chambre Négative (voir décision produit ci-dessus).
- **Fiches techniques (recettes)** : nom d'ingrédient éditable, remplissage automatique du prix, correction du menu déroulant d'ingrédients (rogné, bouton "+" bloqué), exclusion des catégories non culinaires des suggestions, unification du calcul de coût recette.
- **Catalogue produits** : renommé en "Liste des Produits", 4 tuiles KPI cliquables comme filtres de statut, actions voir/éditer/supprimer.
- **Achats/Fournisseurs** : réparation de la suppression des commandes et des fournisseurs, harmonisation des confirmations de suppression.
- **Autres** : remplacement des menus déroulants natifs par un vrai composant Combobox, catégorie d'établissement "Restaurant - Lounge - Rooftop", fallback automatique de prix appliqué partout où il manquait, création de `CLAUDE.md`.
