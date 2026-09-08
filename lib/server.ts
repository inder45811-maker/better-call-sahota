import { env } from 'cloudflare:workers';
import { CONSENT_VERSION } from './validation';
type RuntimeEnv = {
  DB: D1Database;
  RESEND_API_KEY?: string;
  REPORT_FROM_EMAIL?: string;
  ENQUIRY_TO_EMAIL?: string;
  RETENTION_DAYS?: string;
  MAINTENANCE_TOKEN?: string;
};
export const runtime = () => env as unknown as RuntimeEnv;
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
  if (origin && origin !== new URL(request.url).origin)
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
export async function allowRequest(request: Request) {
  const db = runtime().DB;
  if (!db) throw new Error('Enquiries are temporarily unavailable. Please try again later.');
  const now = Date.now(),
    bucket = Math.floor(now / 900000),
    ip = request.headers.get('cf-connecting-ip') ?? 'local-test';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${bucket}:${ip}`));
  const key = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  const row = await db
    .prepare(
      'INSERT INTO rate_limits (key, uses, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET uses = uses + 1 RETURNING uses',
    )
    .bind(key, now + 900000)
    .first<{ uses: number }>();
  await db.batch([
    db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now),
    db.prepare('DELETE FROM leads WHERE expires_at < ?').bind(now),
  ]);
  return !!row && row.uses <= 12;
}
export async function saveLead(id: string, kind: string, payload: unknown) {
  const db = runtime().DB;
  const serialised = JSON.stringify(payload),
    now = Date.now();
  const days = Math.min(365, Math.max(1, Number(runtime().RETENTION_DAYS) || 90));
  // INSERT first handles simultaneous retries without duplicate records.
  await db
    .prepare(
      'INSERT OR IGNORE INTO leads (id, kind, payload, created_at, expires_at, email_status, consent_version) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(id, kind, serialised, now, now + days * 86400000, 'pending', CONSENT_VERSION)
    .run();
  const existing = await db
    .prepare('SELECT payload, created_at, email_status, callback_status FROM leads WHERE id = ?')
    .bind(id)
    .first<{
      payload: string;
      created_at: number;
      email_status: string;
      callback_status: string;
    }>();
  if (!existing || existing.payload !== serialised)
    throw new Error(
      'This form has already been used with different answers. Please start a new request.',
    );
  return {
    createdAt: existing.created_at,
    emailStatus: existing.email_status,
    callbackStatus: existing.callback_status,
  };
}
export async function emailMessage(
  id: string,
  to: string,
  subject: string,
  text: string,
  attachment?: { filename: string; content: string },
) {
  const e = runtime();
  if (!e.RESEND_API_KEY || !e.REPORT_FROM_EMAIL || !to) return 'not-configured';
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: 'Bearer ' + e.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': id,
      },
      body: JSON.stringify({
        from: e.REPORT_FROM_EMAIL,
        to: [to],
        subject,
        text,
        ...(attachment ? { attachments: [attachment] } : {}),
      }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
export async function updateDelivery(id: string, status: string) {
  await runtime()
    .DB.prepare('UPDATE leads SET email_status = ? WHERE id = ?')
    .bind(status, id)
    .run();
}
export async function updateCallbackDelivery(id: string, status: string) {
  await runtime()
    .DB.prepare('UPDATE leads SET callback_status = ? WHERE id = ?')
    .bind(status, id)
    .run();
}
