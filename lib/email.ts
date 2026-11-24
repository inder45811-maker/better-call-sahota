const providerErrors = new Set([
  'validation_error',
  'missing_api_key',
  'restricted_api_key',
  'suspended_api_key',
  'invalid_permission',
  'daily_quota_exceeded',
  'monthly_quota_exceeded',
  'rate_limit_exceeded',
  'invalid_idempotent_request',
  'concurrent_idempotent_requests',
]);

export async function emailMessage(
  id: string,
  to: string,
  subject: string,
  text: string,
  replyTo?: string,
) {
  const e = process.env;
  if (!e.RESEND_API_KEY || !e.REPORT_FROM_EMAIL || !to) {
    console.warn('[enquiry-email] configuration missing', {
      hasApiKey: Boolean(e.RESEND_API_KEY),
      hasSender: Boolean(e.REPORT_FROM_EMAIL),
      hasRecipient: Boolean(to),
    });
    return 'not-configured';
  }
  const signal = AbortSignal.timeout(15000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal,
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
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (response.ok) return 'sent';

    const error: { name?: unknown; message?: unknown } | null = await response
      .json()
      .catch(() => null);
    const message = typeof error?.message === 'string' ? error.message : '';
    const reason = /api key is invalid/i.test(message)
      ? 'invalid-key'
      : /domain is not verified/i.test(message)
        ? 'unverified-sender-domain'
        : /only send testing emails/i.test(message)
          ? 'test-recipient-restriction'
          : undefined;
    console.warn('[enquiry-email] Resend rejected request', {
      status: response.status,
      code:
        typeof error?.name === 'string' && providerErrors.has(error.name)
          ? error.name
          : 'unknown',
      reason,
    });
    return 'failed';
  } catch {
    console.warn('[enquiry-email] Resend request failed', {
      reason: signal.aborted ? 'timeout' : 'network-error',
    });
    return 'failed';
  }
}
