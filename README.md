# Atelier Nivagion

Production-ready artist portfolio and small original-art shop for [nivagion.com](https://nivagion.com).

The app uses Next.js App Router, TypeScript, Tailwind CSS, Cloudflare Workers through `@opennextjs/cloudflare`, Cloudflare D1 for structured data, Cloudflare R2 for private artwork images, and Cloudflare Access for `/admin`.

## Install on Windows

Install Node.js 22 LTS or newer, then run from the repository root:

```powershell
npm install
copy .dev.vars.example .dev.vars
```

For local admin access, keep `ADMIN_DEV_BYPASS="true"` in `.dev.vars`. Never enable that value in production.

## Run Locally

Plain Next.js development server:

```powershell
npm run dev
```

Open `http://localhost:3000`.

For local D1/R2 bindings through Wrangler:

```powershell
npm run db:migrate:local
npm run db:seed:local
npm run preview
```

## Quality Checks

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Cloudflare D1

Create the database:

```powershell
npx wrangler d1 create nivagion-gallery-db
```

Copy the returned database id into `wrangler.jsonc` under `d1_databases[0].database_id`.

Apply local migrations:

```powershell
npm run db:migrate:local
```

Apply production migrations:

```powershell
npm run db:migrate:prod
```

Seed local demo content:

```powershell
npm run db:seed:local
```

The sample artworks are labelled `DEMO:` and must be replaced before launch.

## Cloudflare R2

Create the private bucket:

```powershell
npx wrangler r2 bucket create nivagion-artwork-images
```

The binding is already declared in `wrangler.jsonc` as `ARTWORK_IMAGES`. The browser never receives unrestricted write access; admin uploads go through a server route that validates MIME signatures and size.

## Cloudflare Access

Protect `/admin*` in Cloudflare Zero Trust with an Access application for `nivagion.com/admin`.

Policy:

- Allow only `admin@example.com`.
- Ensure Cloudflare sends `Cf-Access-Authenticated-User-Email`.
- Keep `ADMIN_EMAIL="admin@example.com"` in production variables.
- Keep `ADMIN_DEV_BYPASS="false"` in production.

The app checks the verified Access email server-side for every admin page and mutation.

## Environment Variables

Use `.dev.vars` locally and Cloudflare Worker variables in production:

```text
SITE_URL="https://nivagion.com"
ADMIN_EMAIL="admin@example.com"
ADMIN_DEV_BYPASS="false"
TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

Turnstile is optional and can be wired once keys exist. The project runs locally without those keys.

## Custom Domain

In Cloudflare Workers:

1. Add `nivagion.com` as a route or custom domain for the Worker.
2. Confirm DNS is managed by Cloudflare.
3. Set `SITE_URL="https://nivagion.com"`.
4. Re-run `npm run deploy`.

Do not change DNS or purchase domains from this repository.

## Deploy Manually

```powershell
npm run deploy
```

This builds with OpenNext and deploys the Worker with Wrangler.

## Automatic GitHub Deployment

In Cloudflare Workers dashboard:

1. Connect the GitHub repository.
2. Use `npm install` as the install command.
3. Use `npm run deploy` or Cloudflare's generated OpenNext build command.
4. Add production variables.
5. Ensure D1 and R2 bindings match `wrangler.jsonc`.

## Replacing Sample Content

1. Run locally with D1 migrations.
2. Visit `/admin`.
3. Create the first real artwork as a draft.
4. Upload JPEG, PNG, WebP or AVIF photos.
5. Add required alt text, dimensions, medium, price and status.
6. Mark the real artwork published and available.
7. Archive or delete the `DEMO:` entries from the database before launch.

## Adding a Revolut Payment Link Later

Edit an artwork in `/admin/artworks/[id]` and paste its Revolut payment URL. When a visitor submits checkout, the app creates a pending order, temporarily reserves the artwork, and shows the Revolut link. Payment still needs manual admin confirmation.

No card data is collected, transmitted or stored by this app.

## Backups

Back up D1:

```powershell
npx wrangler d1 export nivagion-gallery-db --remote --output=backup.sql
```

Back up R2 images:

```powershell
npx wrangler r2 object get nivagion-artwork-images/path/to/object --file=local-copy
```

For full-bucket backup, use Cloudflare R2 S3-compatible tooling such as `rclone` or `aws s3 sync` with scoped R2 credentials. Do not commit exported data or credentials.

## Legal Notes

Privacy, terms, shipping, seller identity and Croatian tax/business information are intentionally labelled in source and admin settings as requiring review. Do not publish those sections as final legal advice without review.
