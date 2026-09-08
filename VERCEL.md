# Vercel deployment

Target workspace: https://vercel.com/inder458-1628s-projects

Import `inder45811-maker/better-call-sahota` with the Next.js framework preset, repository root, Node.js 24 and the default `npm run build` command. The application now runs on Vercel's Node.js functions; it does not require a Cloudflare binding. `vercel.json` selects London for server functions and schedules daily retention cleanup.

## Connect the services

1. Connect an authorised PostgreSQL database and set its pooled connection string as `DATABASE_URL` (or `POSTGRES_URL`). Use a separate database for previews and CI. Keep the provider's connection string server-side and choose its storage region deliberately.
2. Apply the committed PostgreSQL migrations to that database using `npm run db:migrate` with the connection variable available. The migration runner uses a transaction, a lock and checksums; rerunning it is safe. It is deliberately separate from the web build so a preview build cannot change the production database.
3. Set `NEXT_PUBLIC_SITE_URL` to the real Vercel URL or verified custom domain. Set strong, separate `CRON_SECRET` and `MAINTENANCE_TOKEN` values.
4. To deliver requested reports and enquiry notifications, configure `RESEND_API_KEY`, a verified `REPORT_FROM_EMAIL`, and the client's `ENQUIRY_TO_EMAIL`. Until then, submissions explicitly state that email notifications are not connected.
5. Keep Vercel deployment protection enabled during client review. `site.preview` controls indexing and preview copy; it does not provide access control. Complete the factual client details in `LAUNCH-CHECKLIST.md` before public launch.

The website and direct Calendly/telephone/WhatsApp links render without a database. Forms and PDF report generation require PostgreSQL and fail clearly if it is missing; there is no pretend capture or browser-only lead store. The existing Sites preview remains separate until the Vercel deployment is verified.

The commercial client site requires a Vercel plan permitting commercial use. Vercel's published Hobby terms restrict it to personal, non-commercial use. Plan purchases and database/email billing are account-owner choices; no subscription has been purchased by this repository.

Sources: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [environment variables](https://vercel.com/docs/environment-variables), [cron security](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Hobby plan](https://vercel.com/docs/plans/hobby).
