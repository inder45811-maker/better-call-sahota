export async function emailMessage(
  id: string,
  to: string,
  subject: string,
  text: string,
  replyTo?: string,
) {
  const e = process.env;
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
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}
