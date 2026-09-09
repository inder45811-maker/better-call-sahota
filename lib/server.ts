import { isAllowedOrigin } from './request-origin';
type RuntimeEnv = {
  RESEND_API_KEY?: string;
  REPORT_FROM_EMAIL?: string;
  ENQUIRY_TO_EMAIL?: string;
};
export const runtime = () => process.env as RuntimeEnv;
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export async function readBody(request: Request) {
  const origin = request.headers.get('origin');
  if (
    !isAllowedOrigin(
      request.url,
      origin,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL === '1' ? process.env.VERCEL_URL : undefined,
    )
  )
    throw new Error('This request must be submitted from this website.');
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new Error('Please submit the form as JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Please complete the form.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) {
        await reader.cancel();
        throw new Error('Your submission is too long.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of chunks) {
    bytes.set(part, offset);
    offset += part.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('Please check your form and try again.');
  }
}
// Best-effort per-instance throttling; no personal details or durable records.
const attempts = new Map<string, { count: number; expires: number }>();
export async function allowRequest(request: Request) {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  const ip =
    process.env.VERCEL === '1'
      ? (request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown')
      : 'local-test';
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(Math.floor(now / 900000) + ':' + ip),
  );
  const key = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  const entry = attempts.get(key) ?? { count: 0, expires: now + 900000 };
  if (!attempts.has(key) && attempts.size >= 10000) return false;
  entry.count++;
  attempts.set(key, entry);
  return entry.count <= 12;
}
export { emailMessage } from './email';
