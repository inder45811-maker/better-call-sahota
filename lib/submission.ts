import type { LeadInput } from './validation';

export type SubmissionIdentity = { fingerprint: string; id: string };

// Keep uncertain network retries idempotent, while allowing corrected answers.
// Call with the complete, validated and normalised payload.
export function identifySubmission(
  previous: SubmissionIdentity,
  lead: LeadInput,
  context?: unknown,
): LeadInput {
  const fingerprint = JSON.stringify({ lead: { ...lead, requestId: undefined }, context });
  if (previous.fingerprint !== fingerprint) {
    previous.fingerprint = fingerprint;
    previous.id = lead.requestId;
  }
  return { ...lead, requestId: previous.id };
}
