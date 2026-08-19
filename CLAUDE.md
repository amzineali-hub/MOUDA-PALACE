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
