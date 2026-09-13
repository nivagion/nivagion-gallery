# Atelier Nivagion

A full-stack artist portfolio and original-art storefront for [nivagion.com](https://nivagion.com). The application combines a public, multilingual gallery with protected artwork management, private image storage, purchase requests, and an order workflow on Cloudflare's developer platform.

The repository demonstrates a real Next.js application and deployment architecture. Payment confirmation remains a manual admin process, and the legal, tax, shipping, and seller-information copy requires professional review before it should be treated as final compliance material.

## Screenshots

<!-- Add homepage screenshot -->
<!-- Add artwork page screenshot -->
<!-- Add admin dashboard screenshot -->

## Features

- Responsive public homepage, artwork collection, individual artwork pages, and sold archive
- English and Croatian interface copy
- Draft, available, reserved, and sold artwork states
- Search, filtering, display ordering, and featured artwork controls
- Protected admin dashboard for artwork, image, order, and site-content management
- Single and batch artwork creation with client-side image preparation
- Private R2 image storage with validated server-side upload routes
- Purchase requests that reserve available artwork and create a pending order
- Optional per-artwork Revolut payment-link redirect with manual payment confirmation
- Unit tests for validation, image handling, slugs, and admin routes, plus Playwright public-flow tests

## Architecture

```text
Next.js App Router
    -> public gallery and checkout server actions
    -> Cloudflare Access-protected admin routes
    -> Cloudflare D1 artwork/order/settings data
    -> Cloudflare R2 private artwork images
    -> OpenNext Cloudflare Worker deployment
```

The browser never receives unrestricted R2 write access. Admin mutations and image uploads run through server routes, while `lib/db` and `lib/storage` keep database and object-storage concerns separate from page components.

## Technology Stack

- Next.js App Router and React
- TypeScript
- Tailwind CSS
- OpenNext for Cloudflare Workers
- Cloudflare D1 and SQL migrations
- Cloudflare R2
- Cloudflare Access
- Zod validation
- Vitest and Playwright

## Artwork and Admin Workflow

Cloudflare Access supplies the verified administrator email header. The application checks that identity server-side for admin pages and mutations. For local development only, `ADMIN_DEV_BYPASS="true"` enables the admin workflow without Access; it must remain `false` in production.

Administrators can create or edit artwork metadata, upload and reorder images, choose a primary image, publish or archive entries, manage storefront order, and review purchase requests. Demo seed data is prefixed with `DEMO:` and should be replaced before a public launch.

## Payment Flow

The implemented checkout flow validates customer and shipping details, creates a pending order, and temporarily reserves the artwork. If the artwork has a configured Revolut payment URL, the visitor is redirected to that link; otherwise the order becomes a manual purchase request. Payment and fulfilment status are confirmed by the administrator.

The application does not collect or store card details and does not call a Revolut merchant API. A saved payment link is a redirect, not automated payment verification.

## Local Development

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run db:seed:local
npm run preview
```

For the plain Next.js development server, use `npm run dev` and open `http://localhost:3000`. Wrangler preview supplies local D1 and R2 bindings.

Example configuration:

```text
SITE_URL="https://example.com"
NEXT_PUBLIC_MEDIA_BASE_URL="https://media.example.com"
ADMIN_EMAIL="admin@example.com"
ADMIN_DEV_BYPASS="false"
TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

Keep `.env` and `.dev.vars` local. Only the example files with placeholders belong in source control.

## Tests and Quality Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

The end-to-end suite expects a runnable application and its configured local services.

## Deployment

The tracked `wrangler.jsonc` defines the Worker, D1 binding, R2 binding, and current `nivagion.com` routes. Before deployment:

1. Create or select the production D1 database and R2 bucket.
2. Confirm their names and identifiers in `wrangler.jsonc`.
3. Apply migrations with `npm run db:migrate:prod`.
4. Configure the real `ADMIN_EMAIL` and any Turnstile values in the deployment environment.
5. Protect `/admin*` with a Cloudflare Access policy for the same administrator identity.
6. Run `npm run deploy`.

Do not commit real credentials, exported database data, or production `.dev.vars` files.

## Project Structure

```text
app/             App Router pages, route handlers, and server actions
components/      Public and admin UI components
lib/db/          D1 queries and data access
lib/storage/     R2 image access
lib/payments/    Manual/Revolut-link payment intent abstraction
migrations/      D1 schema and demo seed data
test/            Vitest unit and route tests
tests/e2e/       Playwright browser tests
scripts/         Deployment and test helpers
```

## Current Status and Limitations

- The portfolio, artwork management, image, checkout, and order workflows are implemented.
- Production behavior depends on correctly configured Cloudflare Access, D1, R2, DNS, and Worker variables.
- Turnstile variables exist, but empty values mean bot protection is not configured.
- Payments require manual confirmation; inventory reservation does not prove payment.
- The project includes editable legal and business-information fields, but their content is project copy—not a claim of legal or tax compliance.
- Backup, monitoring, recovery, rate-limit durability, accessibility, and live checkout behavior should be verified before broader public use.

## Project Notes Requiring Review

Privacy, terms, shipping, returns, seller identity, and Croatian business/tax information must be reviewed for the actual seller and operating model. They should not be presented as finalized legal advice solely because fields or placeholder copy exist in the application.
