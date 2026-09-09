import { allowRequest, emailMessage, json, readBody, runtime } from '@/lib/server';
import { validateLead, MARKETING_COPY, CONSENT_VERSION } from '@/lib/validation';
import { createHash } from 'node:crypto';
export async function POST(request: Request) {
  let lead;
  try {
    lead = validateLead(await readBody(request));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Check your details.' }, 400);
  }
  if (!(await allowRequest(request)))
    return json({ error: 'Please wait 15 minutes before trying again.' }, 429);
  const digest = createHash('sha256').update(JSON.stringify(lead)).digest('hex');
  const status = await emailMessage(
    lead.requestId + '-' + digest.slice(0, 24),
    runtime().ENQUIRY_TO_EMAIL ?? '',
    'New Better Call Sim enquiry',
    [
      'Name: ' + lead.name,
      'Email: ' + lead.email,
      'Preferred contact: ' + lead.contactMethod,
      'Phone: ' + lead.phone,
      'Interest: ' + lead.interest,
      'Message: ' + lead.message,
      'Reference: ' + lead.requestId.slice(0, 8),
      'Marketing permission: ' + (lead.marketingEmail ? 'yes' : 'no'),
      'Consent wording: ' + MARKETING_COPY,
      'Consent version: ' + CONSENT_VERSION,
    ].join('\n'),
    lead.email,
  );
  if (status !== 'sent')
    return json(
      {
        error:
          status === 'not-configured'
            ? 'Email enquiries are not connected yet. Your request has not been sent or saved. Please call or WhatsApp Sim.'
            : 'Your enquiry could not be sent. It has not been saved. Please retry, call or WhatsApp Sim.',
      },
      503,
    );
  return json({ delivery: 'sent', reference: lead.requestId.slice(0, 8) });
}
