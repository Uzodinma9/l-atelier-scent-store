# L'Atelier Scent

A responsive fragrance storefront built with React, TypeScript, Vite, and CSS, backed by Supabase and Mailgun.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. The production bundle can be checked with `npm run build`; `npm run lint` runs Oxlint.

Placing an order calls the `/api/send-order` serverless function, which the plain Vite dev server does not serve. To exercise the full order and email flow locally, run the site through the Vercel CLI instead:

```bash
npm i -g vercel
vercel dev
```

## Project structure

```text
api/
  send-order.js     Vercel function that emails orders through Mailgun
src/
  components/       Reusable navigation, product, cart, wishlist, and account UI
  data/loadProducts.ts  Supabase products-table query and row mapping
  lib/supabase.ts   Publishable-key-only Supabase client
  lib/auth.ts       Supabase Auth helpers (Google, email/password, session)
  lib/orders.ts     Client for the /api/send-order endpoint
  pages/            Homepage, catalog, and product-detail routes
  store/            Shared cart and wishlist state with local storage
  utils/            Shared Naira currency formatting
  Storefront.tsx    Route composition and shared storefront controls
  main.tsx          React, router, and store bootstrap
  storefront.css    Responsive luxury storefront design system
  types.ts          Product and cart models
```

Products load from the existing Supabase `products` table using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Prices render in Nigerian naira. The current table schema does not include size or fragrance notes, so the UI labels size as unlisted and leaves notes empty rather than inventing details.

The cart is stored in browser local storage and supports adding, removing, and changing quantities. Checkout collects delivery details, reviews the order, then posts it to `/api/send-order`, which emails a confirmation to the customer and a notification to the atelier through Mailgun. No payment processor is connected yet, so no money is taken. Account sign in uses Supabase Auth with the Google provider (`signInWithOAuth`, backed by the OAuth client created in Google Cloud Console) and email/password.

Verified product-specific photos are used where an exact bottle match was available; remaining catalog items and L'Atelier Signature use local CSS bottle artwork rather than an unrelated product image. Product photos are served by the source retailer's image CDN and need an internet connection. Confirm image usage rights and replace with approved merchant assets before production. Typography uses Google Fonts when available and falls back to system serif/sans fonts offline.

## Service setup

Copy `.env.example` to `.env` and fill in the values. Only `VITE_`-prefixed variables reach the browser; everything used by `api/send-order.js` stays on the server.

### 1. Supabase (database)

1. Create a project and a `products` table (the storefront reads `id, name, brand, description, price, image_url, category, stock, featured, created_at`).
2. Put the project URL and the **publishable** key in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never publish a secret or service-role key behind a `VITE_` name.

### 2. Google auth (Google Cloud Console + Supabase)

1. In Google Cloud Console, create an OAuth 2.0 Client ID of type **Web application**.
2. Add the authorised redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. In Supabase, open Authentication → Providers → Google, enable it, and paste the client ID and secret.
4. Under Authentication → URL Configuration, set the Site URL and add a redirect URL for every origin you deploy to (for example `http://localhost:5173/**` and `https://your-app.vercel.app/**`).
5. Keep the Google client secret out of the repository. Supabase stores it server-side, so `GOOGLE_CLIENT_*` entries are not needed in `.env`; if they were committed, rotate the secret.

### 3. Mailgun (email)

1. Create a Mailgun account and a sending domain. The sandbox domain works for testing but only delivers to addresses you have authorised.
2. Set `MAILGUN_DOMAIN` to that domain and `MAILGUN_API_KEY` to a key from Account → API keys.
3. Set `MAILGUN_FROM` to a verified sender, for example `L'Atelier Scent <orders@your-domain.com>`.
4. Set `ORDER_NOTIFICATION_EMAIL` to the inbox that should receive new-order alerts. It is optional; the customer confirmation is sent either way.

### 4. Optional: store orders in Supabase

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to also insert each order, then create the table:

```sql
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  delivery_address text,
  items jsonb not null,
  subtotal numeric not null,
  currency text not null default 'NGN',
  status text not null default 'received',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
```

The function writes with the service-role key, so no insert policy is needed for the browser.

## Deploy to Vercel (no Git required)

The Vercel CLI uploads the folder straight from your machine, so Git is not needed.

```bash
npm i -g vercel
vercel login
vercel                       # preview deployment
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add MAILGUN_API_KEY
vercel env add MAILGUN_DOMAIN
vercel env add MAILGUN_FROM
vercel env add ORDER_NOTIFICATION_EMAIL
vercel --prod                # production deployment
```

Environment variables are only read at build time, so add them before the production build. Once deployed, add the resulting domain to Supabase → Authentication → URL Configuration or Google sign-in will fail on the live site.

`vercel.json` only contains the rewrite that lets client-side routes such as `/shop` load directly. Serverless functions in `api/` take precedence over that rewrite, so `/api/send-order` is still reachable.
