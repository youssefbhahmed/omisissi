# Foodie 🍳

A marketplace that connects Tunisian families with verified home cooks. Families browse cooks nearby, pick a set menu or individual dishes, and book a cook to prepare fresh meals in their own kitchen.

Built with **Next.js 16** (App Router + React 19), **Supabase** (auth, Postgres, storage), and **Tailwind CSS 4**.

## Features

- **Two roles** — families book meals; cooks manage dishes, set menus, availability, and booking requests.
- **Discover** — search cooks by name/city/specialty, filter by price and rating, and narrow by distance from your region.
- **Booking flow** — date/guests → set menu or à-la-carte dishes → price breakdown. Prices are computed server-side from the cook's stored rates; the client total is only an estimate.
- **Cook dashboard** — dishes (with photo upload to Supabase Storage), set-menu packages, weekly availability, and accept/decline/complete controls for requests.

## Getting started

### 1. Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are on your Supabase project's **Settings → API** page.

### 2. Database

Follow [`supabase/README.md`](supabase/README.md): apply the base schema, the legacy scripts, and **everything in `supabase/migrations/`** (the migrations contain the row-level-security and storage policies — the app is not safe without them).

If the demo seed scripts were ever run against your database, also run `supabase/cleanup_test_accounts.sql` — the seeded accounts use a password that is committed to this repository.

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Checks

```bash
npx tsc --noEmit   # type check
npx eslint .       # lint
npm run build      # production build
```

CI runs all three on every push and pull request (`.github/workflows/ci.yml`).

## Deploying to Vercel

1. Push this repository to GitHub.
2. On [vercel.com](https://vercel.com/new), click **Add New → Project** and import the repository. Vercel auto-detects Next.js — keep the default build settings.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`) for the Production, Preview, and Development environments.
4. Click **Deploy**.
5. In Supabase, go to **Authentication → URL Configuration** and set the **Site URL** to your Vercel domain (e.g. `https://your-app.vercel.app`), and add it to the **Redirect URLs**. This makes email-confirmation links land on the deployed site.
6. Verify: sign up, set a region on the profile page, and make a test booking.

## Project structure

```
src/
  app/
    actions/          # "use server" actions (auth, bookings, dishes, menus)
    dashboard/        # family dashboard, discover, cook detail + booking
    dashboard/cook/   # cook dashboard (dishes, menus, bookings, profile)
    login/ signup/    # auth pages
  components/         # shared client components
  lib/
    booking.ts        # pricing + availability rules (shared client/server)
    types.ts          # DB row shapes used across the app
    supabase/         # Supabase client factories (browser + server)
  middleware.ts       # Supabase session refresh + /dashboard auth gate
supabase/             # SQL: migrations, legacy scripts, cleanup
```
