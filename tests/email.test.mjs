import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailMessage } from '../lib/email.ts';

test('direct email preserves reply-to and idempotency and distinguishes provider failure', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.REPORT_FROM_EMAIL;
  try {
    delete process.env.RESEND_API_KEY;
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      throw new Error('Unexpected network call');
    };
    assert.equal(await emailMessage('id', 'sim@example.com', 'Enquiry', 'Hello'), 'not-configured');
    assert.equal(calls, 0);
    process.env.RESEND_API_KEY = 'test-only';
    process.env.REPORT_FROM_EMAIL = 'website@example.com';
    globalThis.fetch = async (url, init) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(init.headers['Idempotency-Key'], 'stable-id');
      const body = JSON.parse(init.body);
      assert.deepEqual(body.to, ['sim@example.com']);
      assert.equal(body.reply_to, 'visitor@example.com');
      assert.equal(body.attachments, undefined);
      return new Response('{}', { status: 200 });
    };
    assert.equal(
      await emailMessage('stable-id', 'sim@example.com', 'Enquiry', 'Hello', 'visitor@example.com'),
      'sent',
    );
    globalThis.fetch = async () => new Response('{}', { status: 429 });
    assert.equal(await emailMessage('id', 'sim@example.com', 'Enquiry', 'Hello'), 'failed');
    globalThis.fetch = async () => {
      throw new Error('Offline');
    };
    assert.equal(await emailMessage('id', 'sim@example.com', 'Enquiry', 'Hello'), 'failed');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
    if (originalFrom === undefined) delete process.env.REPORT_FROM_EMAIL;
    else process.env.REPORT_FROM_EMAIL = originalFrom;
  }
});
