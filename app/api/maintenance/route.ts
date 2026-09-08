import { json, runtime } from '@/lib/server';
export async function POST(request: Request) {
  const e = runtime();
  if (
    !e.MAINTENANCE_TOKEN ||
    request.headers.get('authorization') !== 'Bearer ' + e.MAINTENANCE_TOKEN
  )
    return json({ error: 'Unauthorised' }, 401);
  await e.DB.batch([
    e.DB.prepare('DELETE FROM leads WHERE expires_at < ?').bind(Date.now()),
    e.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(Date.now()),
  ]);
  return json({ purged: true });
}
