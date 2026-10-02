# L'Atelier Scent

A responsive fragrance storefront built with React, TypeScript, Vite, and CSS.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your browser. The production bundle can be checked with `npm run build`; `npm run lint` runs Oxlint.

## Project structure

```text
src/
  components/       Reusable navigation, product, cart, wishlist, and account UI
  data/loadProducts.ts  Supabase products-table query and row mapping
  lib/supabase.ts   Publishable-key-only Supabase client
  pages/            Homepage, catalog, and product-detail routes
  store/            Shared cart and wishlist state with local storage
  utils/            Shared Naira currency formatting
  Storefront.tsx    Route composition and shared storefront controls
  main.tsx          React, router, and store bootstrap
  storefront.css    Responsive luxury storefront design system
  types.ts          Product and cart models
```

Products load from the existing Supabase `products` table using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Prices render in Nigerian naira. The current table schema does not include size or fragrance notes, so the UI labels size as unlisted and leaves notes empty rather than inventing details.

The cart is stored in browser local storage and supports adding, removing, and changing quantities. Checkout includes a local delivery-details and order-review preview, but it does not send or save delivery details, place orders, or process payment. No authentication provider, payment processor, or order API is connected. The Google button shows the real multicolor mark but remains disabled until an authentication provider is configured.

Verified product-specific photos are used where an exact bottle match was available; remaining catalog items and L'Atelier Signature use local CSS bottle artwork rather than an unrelated product image. Product photos are served by the source retailer's image CDN and need an internet connection. Confirm image usage rights and replace with approved merchant assets before production. Typography uses Google Fonts when available and falls back to system serif/sans fonts offline.
