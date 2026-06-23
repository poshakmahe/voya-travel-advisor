# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Voya** — a gamified AI travel-advisor. A traveler answers a short, adaptive questionnaire and gets a tailored day-by-day trip plan. This repo is a working **prototype** (no backend, no real recommendation engine yet; "save trip" is a stub).

- The web app lives in **`web/`** (Next.js 16, App Router, TypeScript, Tailwind v4, Motion, lucide-react).
- The product/question-framework spec is in **`docs/superpowers/specs/`** — read it to understand intended behavior and deferred ideas (e.g. the no-destination "inspire me" mode).

## Commands

All commands run from `web/`:

```bash
cd web
npm install        # first-time setup
npm run dev        # dev server at http://localhost:3000 (Turbopack)
npm run build      # production build
npm run start      # serve the production build
```

There is **no test suite and no lint step configured** (the scaffold was created with `--no-eslint`). Don't assume `npm test`/`npm run lint` exist.

## Deployment

Hosted on **GitHub Pages** at **https://poshakmahe.github.io/voya-travel-advisor/** as a static export. Pushing to `main` auto-builds and deploys via `.github/workflows/deploy.yml` (builds `web/`, uploads `web/out`, deploys). No manual steps.

- **`web/next.config.ts`** enables this: `output: "export"`, `basePath`/`assetPrefix` of `/voya-travel-advisor` **in production only** (empty in dev so localhost works), `trailingSlash: true` (emits `/when/index.html` so direct links/refresh don't 404 on Pages), and `images.unoptimized` (no server-side optimizer). **The basePath string is the repo name — update it if the repo is renamed.**
- `web/public/.nojekyll` keeps Pages from stripping the `_next` folder.
- **Static-export constraint:** no API routes, server actions, cookies, or default `next/image`. Keep all dynamic logic client-side (it already is). `localStorage` is read only in effects — never during render.

### Trip submission (lead capture)

The `/trip` "save trip" button (`web/app/trip/page.tsx` + `web/lib/submitTrip.ts`) POSTs the completed profile to **Web3Forms**, which emails it to the inbox that owns the access key. The traveler enters their email (captured as the email's reply-to), so the recipient can reply with a full itinerary. The Web3Forms access key is **public by design** — safe to commit and expose in the client bundle.

## Architecture (the big picture)

The questionnaire is **data-driven from a single definition**, with answers in one store and all conditional behavior in one branching module. Understand these four files and you understand the app:

- **`web/lib/trip.ts`** — the source of truth. `FLOW` (ordered step keys) and `META` (per-step label/icon/copy) drive routing, progress, and the journey map. All answer options are `Choice[]` arrays here (`VIBE_OPTIONS`, `FOOD_OPTIONS`, `MEAT_OPTIONS`, `NEEDS_OPTIONS`, …). Also holds currency + budget helpers (`estimateNights`, `buildupTotal`, `fmtMoney`). **Adding or reordering a question step = edit `FLOW` + `META` (+ a page).**

- **`web/lib/store.tsx`** — `TripProvider` (React Context) holds the `Answers` object and persists it to `localStorage` under key `voya-answers-v2`. Screens read/write via the `useTrip()` hook (`{ answers, set, toggle, reset }`). **Bump the storage key when the `Answers` shape changes** (it has been bumped before).

- **`web/lib/branching.ts`** — **all adaptive logic lives here.** Predicates (`hasYoungKids`, `isFamilyOrGroup`, `needsAccessible`, `eatsMeat`, `travelerCount`), the dynamic `applicableFlow(answers)` (which can drop steps — e.g. families with a child <13 skip the Evenings step), and `position(key, answers)` which powers answer-aware progress + prev/next nav. **Change branching behavior here, not scattered across pages.**

- **`web/lib/plan.ts`** — `buildPlan(answers)` turns the profile into a `Plan` (day-by-day, recommended stay, food picks, budget breakdown, adaptive notes). Deterministic by design (no randomness). Known cities have curated `SIGNATURES`; others fall back to generic templates with the destination name woven in. The budget is **omitted entirely for luxury travelers**. Stay/food honor preferences as *soft* (e.g. a family that picked "hotel" gets an apartment suggestion with rationale).

### UI composition

- **`web/components/QuestionLayout.tsx`** — shared chrome for every question screen: brand, the quiet progress bar + "Stop X of N" (both computed via `branching.position`), eyebrow/title/subtitle from `META`, and Back/Continue. Each `web/app/<step>/page.tsx` is thin: it maps a `Choice[]` through `ChoiceTile` and reads/writes `useTrip()`.
- **`web/components/ChoiceTile.tsx`** — the selectable tile used everywhere.
- Route flow: `/` (where) → when → who → vibe → food → experiences → nights → stay → budget → `/summary` → `/celebrate` → `/trip` (the results/itinerary payoff). `/journey` is an overview/hub.

### Design system

- Tokens and theme live in **`web/app/globals.css`** via Tailwind v4 `@theme` (palette: `paper`, `ink`, `coral`, `teal`, `gold`; plus grain/shadow utilities). Aesthetic direction is "Sunlit Passport" (warm editorial) — **avoid generic SaaS-blue / Inter**.
- Fonts are **Fraunces** (display, `.display` class) + **Hanken Grotesk** (body), loaded via `next/font` in `web/app/layout.tsx`.
- **`web/app/template.tsx`** gives every route a gentle fade-and-rise entrance (re-mounts on navigation).
- Gamification is intentionally **dialed down / refined** — quiet progress, soft checks, one tasteful completion moment. Don't add XP counters, streaks, or confetti storms.

## Conventions & gotchas

- **Next.js 16 has real breaking changes** — see `web/AGENTS.md`. Before using unfamiliar Next APIs, read the bundled docs in `web/node_modules/next/dist/docs/`. Turbopack is the default; `params`/`searchParams` are async.
- **Motion imports:** use `motion/react` for React components; `motion` (vanilla) only for the imperative `animate()`.
- **localStorage hydration pattern:** `TripProvider` initializes to `DEFAULTS` on both server and first client render, then loads from `localStorage` in a mount effect. Preserve this — never read `localStorage` during render (it causes hydration mismatches).
- **Array answers** (`vibe`, `diet`, `meats`, `experiences`, `nights`, `stayTypes`, `needs`) toggle via `toggle(key, value)`; exclusivity rules (e.g. diet "none", evenings "quiet") are implemented as custom handlers in those pages.
