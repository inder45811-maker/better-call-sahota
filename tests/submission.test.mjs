import test from 'node:test';
import assert from 'node:assert/strict';
import { identifySubmission } from '../lib/submission.ts';
import { validateLead } from '../lib/validation.ts';
const first = 'c62c6d75-aa2c-4c73-9940-fb0e8253d3cc',
  next = 'c62c6d75-aa2c-4c73-9940-fb0e8253d3cd';
const person = {
  requestId: first,
  name: 'Preview Visitor',
  email: 'preview@example.com',
  phone: '',
  interest: 'IHT report',
  contactMethod: 'email',
  message: '',
  marketingEmail: false,
  callback: false,
  website: '',
};
test('normalised unchanged retries retain their original request identity', () => {
  const state = { id: '', fingerprint: '' };
  identifySubmission(state, validateLead(person));
  assert.equal(
    identifySubmission(
      state,
      validateLead({
        ...person,
        requestId: next,
        name: '  Preview Visitor  ',
        email: 'PREVIEW@example.com',
      }),
    ).requestId,
    first,
  );
});
test('contact, consent and calculation changes each create a new identity', () => {
  for (const update of [
    { email: 'corrected@example.com' },
    { marketingEmail: true },
    { callback: true, contactMethod: 'phone', phone: '07700 900123' },
  ]) {
    const state = { id: '', fingerprint: '' };
    identifySubmission(state, validateLead(person), { savings: 100 });
    assert.equal(
      identifySubmission(state, validateLead({ ...person, ...update, requestId: next }), {
        savings: 100,
      }).requestId,
      next,
    );
  }
  const state = { id: '', fingerprint: '' };
  identifySubmission(state, validateLead(person), { savings: 100 });
  assert.equal(
    identifySubmission(state, validateLead({ ...person, requestId: next }), { savings: 200 })
      .requestId,
    next,
  );
});
