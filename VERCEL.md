# Vercel setup

Use Next.js, repository root, Node 24 and the default build command. The production URL is https://better-call-sahota.vercel.app.

No database, migration, scheduled cleanup or Calendly integration is required. PDF reports are generated locally in the visitor's browser. Calculator answers and the optional name are not posted to the server. The PDF is not emailed or archived.

Enquiries are sent directly through Resend. Configure RESEND_API_KEY, REPORT_FROM_EMAIL (a verified sender), and ENQUIRY_TO_EMAIL (Sim's inbox). NEXT_PUBLIC_SITE_URL must be the canonical public URL. Secrets must never use the NEXT_PUBLIC_ prefix.

Email success means provider acceptance, not guaranteed inbox delivery. Failure or missing configuration returns an error and does not claim the enquiry was saved. No lead database is kept. Resend idempotency keys reduce duplicate delivery during its supported retry window; there is no durable retry queue. Per-instance throttling is best-effort and resets on cold starts; configure platform rate limits for stronger abuse protection.

Historical database migrations and Sites packaging metadata are retained only as history. They are not used by this application. Mailbox retention and final business disclosures still need confirmation. Search indexing remains disabled for review.
