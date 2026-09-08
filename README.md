# Better Call Sim

A responsive financial, estate and property-planning website built from the supplied brief. Vinext/React, Tailwind, Base UI components, a Cloudflare Worker and D1-backed enquiries. The GitHub repository name is `better-call-sahota`; the customer-facing brand follows the brief: **Better Call Sim**.

## Run and check

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`. Apply the generated D1 migrations to the local database before testing form submissions. `npm run typecheck` checks TypeScript; `npm test` checks the calculator and lead validation; `npm run build` creates the Worker and browser assets. `npm run test:browser` checks the built site using Playwright and a local Wrangler server on port 4173.

GitHub Actions runs installation, type checking, unit tests, Drizzle migration generation, the production build and browser tests. Its artifact contains the built site, migrations, screenshots, a sample PDF and browser test results. No email credentials are supplied in CI, so tests never send real emails.

## Content and branding

- `lib/site.ts`: brand, adviser biography, portrait, Instagram link, verified contact details, service pillars and preview flag.
- `lib/services.json`: all 20 services, FAQs, considerations and cross-links.
- `lib/editorial.ts`: educational guides and clearly labelled hypothetical planning scenarios.
- `lib/legal.ts`: preview policy wording and provider-specific regulatory information.
- `app/globals.css`: shared theme and responsive design.

The user supplied `https://www.instagram.com/bettercallsimuk/`. Its contents were not accessible during the build. Only that link has been used; no name, portrait, experience, credentials or contact number was inferred. Photos are contextual images, not Sim’s property or client assets. See `CONTENT-SOURCES.md` and `ASSET-SOURCES.md`.

## Enquiries and reports

`POST /api/enquiry` stores an appointment request, not a confirmed booking. `POST /api/report` validates the calculator on the server, stores the request and returns a branded PDF directly. Report URLs are not public and PDFs are not stored in browser storage. There is no public lead-listing endpoint. D1 data access is restricted to the platform’s authorised operators.

Both routes validate input, reject cross-origin submissions, enforce a request size limit, rate-limit hashed IP buckets and use a unique request ID to handle retries. Successful submissions accurately disclose whether email is connected. Failed submission states retain the visitor’s entries. Any message to an adviser is server-side only.

Unchanged retries reuse their request identity; corrected contact details, consent or calculator answers receive a new identity. Report and callback notifications have independent delivery states and idempotency keys. A failed report delivery can be retried from the result screen, and the attachment is deterministic for the saved request.

Configure the keys in `.env.example` as hosted secrets through Sites when the client has selected and authorised the email setup:

- `RESEND_API_KEY` and `REPORT_FROM_EMAIL`: requested report delivery from a verified sending domain.
- `ENQUIRY_TO_EMAIL`: adviser notification destination.
- `RETENTION_DAYS`: defaults to 90; the client must justify and approve this setting.
- `MAINTENANCE_TOKEN`: strong secret for a scheduled `POST /api/maintenance` call with `Authorization: Bearer ...`.

Expired records are deleted opportunistically on submissions and through the protected maintenance endpoint. Configure a regular purge job before public launch. Marketing email permission is separate from report fulfilment and callback requests, with the exact wording/version retained. No marketing automation, analytics or optional tracking is enabled.

## IHT calculation scope

`lib/iht.ts` contains deterministic, effective-dated 2026/27 rules. It supports straightforward UK individual or surviving-spouse/civil-partner estates, known unused allowance percentages, full qualifying spouse exemption, the ordinary nil-rate band and a conditional residence allowance capped by the qualifying home interest and tapered using the appropriate net-estate basis.

It does **not** assume every couple has a £1m allowance. It does not silently exclude pensions, apply post-6 April 2027 pension rules early or compute unsupported tax years. Unclear residence, mixed beneficiaries, relevant gifts, trusts, business/agricultural assets, charity gifts, downsizing and other specialist factors withhold a headline estimate and generate a report explaining why review is needed. Review the scope and source rules with an appropriate professional before launch; this is not a full tax-return engine or an advice engine.

The PDF and on-screen amounts use the same server result. No projected savings, guarantees or product recommendation is generated. The optional WebMCP `prepare_iht_illustration` tool stages valid answers only; it does not capture contact details, send reports or make an enquiry. Unsupported browsers continue normally.

## Launch requirements

This site remains a private preview with search indexing disabled. Complete the client inputs in `LAUNCH-CHECKLIST.md` before changing `site.preview` or requesting public deployment. In particular, verify the actual financial/property providers and permissions, estate-planning provider and jurisdiction, legal identity, direct contact details, biography and any credentials. Do not add an FCA or STEP badge on assumption.

Telephone/WhatsApp controls lead to the contact page while numbers are unverified, rather than using invented numbers. The supplied Instagram profile works as an external contact route. Authentic adviser video assets must be supplied with captions/transcripts before embedding; the current video feature links to Instagram. The three planning scenarios are explicitly fictional illustrations and can be replaced by consented genuine case studies.

## Hosting

The scaffold's affected runtime dependencies have been updated. The remaining moderate audit finding is in Drizzle Kit's development-only esbuild transformer chain; its inspected use is transform/transformSync, while the advisory concerns the esbuild development server. Keep it out of the deployed Worker and reassess when Drizzle provides a compatible update. Do not apply npm audit's suggested breaking Drizzle downgrade.

`.openai/hosting.json` records the existing Sites project and the logical D1 binding. Keep this ID when iterating. Source credentials are never stored in the repository. Production packaging must include the Worker, browser assets, logical hosting metadata and generated migrations. A public deployment is a separate action from the private review preview.
