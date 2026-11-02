# Production security deployment

The application changes in this PR take effect only after the OpenNext Worker is deployed. No production deployment or Cloudflare dashboard setting is changed by this PR.

## Observed before deployment (2026-11-02)

| Request | Response | Security headers |
| --- | --- | --- |
| `http://nivagion.com/` | `200` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy absent |
| `https://nivagion.com/` | `200` | Same headers absent |
| `http://www.nivagion.com/` | `200` | Same headers absent |
| `https://www.nivagion.com/` | `200` | Same headers absent |
| `http://nivagion.com/admin` | `301` to HTTPS | Cloudflare Access applies on the apex host |
| `https://nivagion.com/admin` | `302` to Cloudflare Access login | Access challenge confirmed |
| `https://www.nivagion.com/admin` | `404` | No Access challenge on this host; app denies it |

The local `wrangler dev` preview of this PR returned CSP and the other security headers on HTML, CSS, SVG, image errors, locale redirects, and admin responses. The homepage had 11 script tags, each carrying the response nonce. The locale cookie had `Secure`, `HttpOnly`, and `SameSite=Lax`. These are preview results, not post-deployment evidence.

The locked Next.js and OpenNext packages were updated, and compatible transitive audit fixes were applied. `npm audit --omit=dev` now reports **0 critical, 5 high, and 1 moderate** advisories. The remaining high findings are in OpenNext's dependency tree and Zod 3. The audit's proposed OpenNext and Zod fixes require incompatible major-version changes, so these advisories need a separate compatibility review rather than an untested change to this deployment.

## Cloudflare owner steps

1. In **SSL/TLS → Overview**, use **Full (strict)** for both site hostnames and confirm a valid origin certificate.
2. In **SSL/TLS → Edge Certificates**, enable **Always Use HTTPS** for the `nivagion.com` zone. This must redirect `http://nivagion.com/<path>?<query>` to the same HTTPS URL before the Worker runs. Confirm the same behavior for `www`.
3. In **Rules → Redirect Rules**, create an enabled permanent redirect for `http.host eq "www.nivagion.com"` to `https://nivagion.com` plus the original path, with **preserve query string** enabled. A dynamic target expression is `concat("https://nivagion.com", http.request.uri.path)`. Set status `301`. This makes canonicalization happen at the edge; the Worker also has a `308` fallback for requests that reach it.
4. In **Zero Trust → Access → Applications**, verify the self-hosted application covers `nivagion.com/admin` and every `/admin/*` path, including `/admin/api/*` and Server Action POSTs. Restrict it to the intended administrator. Confirm the application audience tag and team domain still match `CF_ACCESS_AUD` and `CF_ACCESS_TEAM_DOMAIN` in `wrangler.jsonc`. If the Access application changes, update these values before deploying. The Worker checks the signed JWT, issuer, audience, expiration, and administrator email; an email header alone never authorizes a request.
5. After deployment and redirect verification, keep HSTS at `max-age=31536000` **without** `includeSubDomains` or `preload`. This Worker supplies it on site responses. `media.nivagion.com` is a separate R2 hostname and was not verified as HTTPS-only; including subdomains now would be premature. Cloudflare Access challenges can be produced before the Worker, so inspect their headers separately if uniform HSTS on those responses is required.

## Post-deployment checks

Use `curl -sS -D - -o /dev/null --max-redirs 0` against each of the four site URL variants, first at `/`, then at `/works?sort=new`. Check that HTTP permanently redirects to HTTPS, `www` permanently redirects to `https://nivagion.com`, and path and query survive. Follow each redirect chain to confirm there is no loop. On HTTPS HTML, inspect CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS. Check one `/_next/static/chunks/*.css` asset, `/icon.svg`, `/images/<known-key>`, `/api/locale`, `/admin`, and an unauthenticated admin upload request. Re-run SecurityHeaders.com on both `http://nivagion.com` and `https://nivagion.com` after the edge changes propagate.

Open the homepage, artwork, contact, checkout, and authenticated admin upload screens on desktop and mobile. Inspect browser console CSP reports and test navigation, forms, image display, and upload previews. The automated browser suite exercises public hydration and navigation against the local OpenNext Worker; a production browser pass remains necessary after deployment.
