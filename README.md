# 🏆 Prize Arena

An online **prize-competitions platform** — buy tickets to win cars, tax-free cash and
the latest tech, answer a skill-based question to enter, and watch the live draw. Inspired
by the popular UK competition-site format, built as an original, self-contained app.

> ⚠️ This is a demonstration project. Running real prize competitions in the UK has legal
> obligations (Gambling Act 2005, age verification, a genuine free-entry route, clear
> T&Cs, and proper draw integrity). Get legal advice before going live.

## ✨ What's included

- **Home** — hero featured draw, trust strip, live competitions grid, "how it works".
- **Competitions** — filterable grid (cars / cash / tech / lifestyle / instant wins).
- **Competition detail** — gallery, live countdown, % sold progress, ticket picker,
  skill question, instant-win panel, cash-alternative.
- **Ticket entry flow** — quantity picker + per-competition skill question, slide-out
  basket, checkout.
- **Checkout** — server-validated skill answers, ticket-number allocation, instant-win
  reveal. Real **Stripe** PaymentIntents when configured, otherwise a built-in mock.
- **Winners** hall of fame, **How it works**, **FAQ**.
- **Account** and **Admin** dashboards (demo data).

## 🧱 Tech

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** dark/gold theme
- **Zustand** persistent cart
- API via Next.js **route handlers** (`src/app/api/*`)
- **Prisma + Postgres** for the real data path
- **Stripe** for payments

The app **runs with zero infrastructure**: with no `DATABASE_URL` it uses an in-memory
seed store, and with no `STRIPE_SECRET_KEY` it uses a mock checkout. Add those env vars to
switch on the real Postgres + Stripe paths — no code changes required.

## 🚀 Quick start

```bash
cd frontend
npm install
cp .env.example .env      # optional — works without it
npm run dev               # http://localhost:3000
```

Or from the repo root: `npm install && npm run dev`.

## 🗄️ Enabling the real database (optional)

```bash
# 1. Point DATABASE_URL at a Postgres instance (docker-compose provides one)
# 2. Create the schema and seed it:
cd frontend
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

The data layer in `src/lib/store.ts` automatically uses Prisma whenever
`DATABASE_URL` is set, and falls back to `src/data/competitions.ts` otherwise.

## 💳 Enabling real payments (optional)

Set the following in `frontend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # for /api/webhook
```

`/api/checkout` then creates a real PaymentIntent and returns a `clientSecret`.
Without keys it returns an instant mock "paid" order so the flow stays demoable.

## 📁 Structure

```
frontend/
  prisma/                 schema.prisma + seed.ts
  src/
    app/                  pages + /api route handlers
    components/           layout, competition, cart, home, ui
    data/competitions.ts  seed catalogue (source of truth)
    lib/                  store (data access), db (prisma), stripe, utils
    store/cartStore.ts    zustand basket
    types/                domain types
```

> The `backend/` directory contains an earlier NestJS scaffold and is no longer used —
> Prize Arena's backend lives entirely in the Next.js route handlers + Prisma. It can be
> removed or repurposed.

## 🔑 Editing competitions

All demo content lives in `frontend/src/data/competitions.ts`. Add or edit entries there;
they appear immediately in dev and are also what `prisma:seed` loads into Postgres.

## ⚖️ Compliance checklist (before going live)

- 18+ age verification and UK-residency checks at sign-up/checkout
- A genuine free postal/online entry route with equal chance of winning
- Published, accessible Terms & Conditions and Privacy Policy
- Verifiable, auditable draw mechanism
- Responsible-play messaging and self-exclusion options
- Appropriate insurance/escrow for advertised prizes

---

Built as an original implementation. Not affiliated with any existing competition brand.
