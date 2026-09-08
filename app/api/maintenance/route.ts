import { json, runtime, purgeExpired } from '@/lib/server';
export async function POST(request: Request) {
  const secret = runtime().MAINTENANCE_TOKEN;
  if (!secret || request.headers.get('authorization') !== 'Bearer ' + secret)
    return json({ error: 'Unauthorised' }, 401);
  try {
    await purgeExpired();
    return json({ purged: true });
  } catch {
    return json({ error: 'Cleanup could not be completed.' }, 503);
  }
}
// Vercel cron sends an authenticated GET. It is disabled until CRON_SECRET is configured.
export async function GET(request: Request) {
  const secret = runtime().CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== 'Bearer ' + secret)
    return json({ error: 'Unauthorised' }, 401);
  try {
    await purgeExpired();
    return json({ purged: true });
  } catch {
    return json({ error: 'Cleanup could not be completed.' }, 503);
  }
}
