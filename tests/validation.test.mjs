import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLead } from '../lib/validation.ts';
import { reviewStatus } from '../lib/review.ts';
const lead = {
  requestId: 'c2919890-49b2-4ba9-9a74-b157264a3e7c',
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
test('report fulfilment needs no marketing consent or telephone', () => {
  const r = validateLead(lead);
  assert.equal(r.marketingEmail, false);
  assert.equal(r.phone, '');
});
test('callback or telephone preference requires a number', () => {
  assert.throws(() => validateLead({ ...lead, callback: true }));
  assert.throws(() => validateLead({ ...lead, contactMethod: 'phone' }));
  assert.equal(
    validateLead({ ...lead, callback: true, phone: '07700 900123' }).phone,
    '07700 900123',
  );
});
test('invalid email, unsafe fields and bot field rejected', () => {
  for (const patch of [
    { email: 'bad' },
    { email: 'test@example.com\r\nBcc: x@y.com' },
    { name: '' },
    { message: 'x'.repeat(1001) },
    { website: 'spam' },
    { marketingEmail: 'yes' },
    { requestId: 'known-id' },
  ])
    assert.throws(() => validateLead({ ...lead, ...patch }));
});

test('qualification routes clear, exploratory and out-of-scope requests correctly', () => {
  const review = {
    audience: 'family',
    location: ['England'],
    trigger: ['New mortgage'],
    needs: ['Wills', 'Protection'],
    timing: ['Within 3 months'],
    circumstances: ['Own home'],
    proposal: ['Yes'],
  };
  for (const [patch, status] of [
    [{}, 'ready'],
    [{ location: ['Scotland'] }, 'scope-check'],
    [{ timing: ['Later'] }, 'scope-check'],
    [{ timing: ['Exploring'] }, 'exploring'],
    [{ proposal: ['Information only'] }, 'exploring'],
    [{ needs: ['Not sure'] }, 'scope-check'],
  ])
    assert.equal(
      reviewStatus(
        validateLead({ ...lead, review: { ...review, ...patch } }).review,
      ),
      status,
    );
  assert.throws(() =>
    validateLead({
      ...lead,
      review: { ...review, needs: ['Unlisted answer'] },
    }),
  );
});

test('enquiry accepts campaign labels and drops unknown or malformed tracking fields', () => {
  const result = validateLead({
    ...lead,
    firstCampaign: {
      utm_source: 'instagram',
      utm_content: 'person@example.com',
      extra: 'ignored',
    },
    latestCampaign: { utm_campaign: 'family plans', utm_medium: ['social'] },
  });
  assert.deepEqual(result.firstCampaign, { utm_source: 'instagram' });
  assert.deepEqual(result.latestCampaign, { utm_campaign: 'family plans' });
});
