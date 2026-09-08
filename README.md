# Better Call Sim

A responsive financial, estate and property-planning website built from the supplied brief. Next.js/React, Tailwind, Base UI components and PostgreSQL-backed enquiries, prepared for Vercel. The GitHub repository name is `better-call-sahota`; the customer-facing brand follows the brief: **Better Call Sim**.

## Run and check

Use Node.js 24 and npm. Run `npm ci`, copy `.env.example` to `.env.local`, and set a PostgreSQL connection URL. Apply migrations with `node --env-file=.env.local scripts/migrate-postgres.mjs`, then run `npm run dev`. `npm run typecheck` checks TypeScript; `npm test` checks the calculator and lead validation; `npm run build` creates the production Next.js application. `npm run test:browser` checks the built site using Playwright and Next.js on port 4173.

GitHub Actions runs type checking, unit tests, PostgreSQL migration checks, the production build and browser tests against a disposable PostgreSQL service. Its artifact contains screenshots, a sample PDF and browser test results. No email credentials are supplied in CI, so tests never send real emails.

## Content and branding

- `lib/site.ts`: brand, adviser biography, portrait, Instagram link, verified contact details, service pillars and preview flag.
- `lib/services.json`: all 20 services, FAQs, considerations and cross-links.
- `lib/editorial.ts`: educational guides and clearly labelled hypothetical planning scenarios.
- `lib/legal.ts`: preview policy wording and provider-specific regulatory information.
- `app/globals.css`: shared theme and responsive design.

The user supplied `https://www.instagram.com/bettercallsimuk/` and three screenshots of the profile and posts. The revised design follows that black/navy and yellow visual identity. Those screenshots identify Simran Sahota, display 07711 902299 and link to `https://calendly.com/estateplanningexpertise`. The site uses those supplied contact details and a short proposed biography without invented qualifications. The logo and portrait are cleaned preview reconstructions; replace them with original high-resolution assets when available. See `CONTENT-SOURCES.md` and `ASSET-SOURCES.md`.

## Enquiries and reports

`POST /api/enquiry` stores an appointment request, not a confirmed booking. `POST /api/report` validates the calculator on the server, stores the request and returns a branded PDF directly. Report URLs are not public and PDFs are not stored in browser storage. There is no public lead-listing endpoint. PostgreSQL access uses a server-only connection string. Without a configured database, forms return an honest unavailable response and retain the visitor's answers.

Both routes validate input, reject cross-origin submissions, enforce a request size limit, rate-limit hashed IP buckets and use a unique request ID to handle retries. Successful submissions accurately disclose whether email is connected. Failed submission states retain the visitor’s entries. Any message to an adviser is server-side only.

Unchanged retries reuse their request identity; corrected contact details, consent or calculator answers receive a new identity. Report and callback notifications have independent delivery states and idempotency keys. A failed report delivery can be retried from the result screen, and the attachment is deterministic for the saved request.

Configure the keys in `.env.example` in Vercel's project environment variables:

- `DATABASE_URL`: the selected PostgreSQL provider's pooled connection string; `POSTGRES_URL` is also supported.
- `NEXT_PUBLIC_SITE_URL`: the verified deployment origin used for canonical links and sitemap URLs.

- `RESEND_API_KEY` and `REPORT_FROM_EMAIL`: requested report delivery from a verified sending domain.
- `ENQUIRY_TO_EMAIL`: adviser notification destination.
- `RETENTION_DAYS`: defaults to 90; the client must justify and approve this setting.
- `MAINTENANCE_TOKEN`: strong secret for a scheduled `POST /api/maintenance` call with `Authorization: Bearer ...`.
- `CRON_SECRET`: a separate strong secret for Vercel's daily authenticated `GET /api/maintenance` job.

Expired records are deleted opportunistically on submissions and through the protected maintenance endpoint. Configure a regular purge job before public launch. Marketing email permission is separate from report fulfilment and callback requests, with the exact wording/version retained. No marketing automation, analytics or optional tracking is enabled.

## IHT calculation scope

`lib/iht.ts` contains deterministic, effective-dated 2026/27 rules. It supports straightforward UK individual or surviving-spouse/civil-partner estates, known unused allowance percentages, full qualifying spouse exemption, the ordinary nil-rate band and a conditional residence allowance capped by the qualifying home interest and tapered using the appropriate net-estate basis.

It does **not** assume every couple has a £1m allowance. It does not silently exclude pensions, apply post-6 April 2027 pension rules early or compute unsupported tax years. Unclear residence, mixed beneficiaries, relevant gifts, trusts, business/agricultural assets, charity gifts, downsizing and other specialist factors withhold a headline estimate and generate a report explaining why review is needed. Review the scope and source rules with an appropriate professional before launch; this is not a full tax-return engine or an advice engine.

The PDF and on-screen amounts use the same server result. No projected savings, guarantees or product recommendation is generated. The optional WebMCP `prepare_iht_illustration` tool stages valid answers only; it does not capture contact details, send reports or make an enquiry. Unsupported browsers continue normally.

## Launch requirements

This site remains a private preview with search indexing disabled. Complete the client inputs in `LAUNCH-CHECKLIST.md` before changing `site.preview` or requesting public deployment. In particular, verify the actual financial/property providers and permissions, estate-planning provider and jurisdiction, legal identity, direct contact details, biography and any credentials. Do not add an FCA or STEP badge on assumption.

Telephone and WhatsApp controls use the number displayed in the supplied posts. The review page also links to the Calendly profile shown in the supplied bio. Authentic adviser video assets must be supplied with captions/transcripts before embedding; the current video feature links to Instagram. The three planning scenarios are explicitly fictional illustrations and can be replaced by consented genuine case studies.

## Hosting

The affected runtime dependencies have been updated. The remaining moderate audit finding is in Drizzle Kit's development-only esbuild transformer chain; its inspected use is transform/transformSync, while the advisory concerns the esbuild development server. Keep it out of production functions and reassess when Drizzle provides a compatible update. Do not apply npm audit's suggested breaking Drizzle downgrade.

See `VERCEL.md` for deployment. The current application uses standard Next.js server functions and PostgreSQL. The earlier Sites preview's project metadata is retained in `deployment/sites/hosting.json`, and its SQLite migrations remain under `drizzle/` as historical records. Do not apply those SQLite files to PostgreSQL. The Vercel migration directory is `drizzle-postgres/`. No database contents have been copied from the old preview.
