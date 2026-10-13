import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIht,
  validateIht,
  resetForScenario,
  ihtSummary,
  EMPTY_IHT,
  IHT_RULES,
  COUPLE_HEADING,
  COUPLE_EXPLANATION,
  SCENARIO_LABELS,
} from '../lib/iht.ts';
const valid = {
  ...EMPTY_IHT,
  residence: 'straightforward-uk',
  beneficiaries: 'others',
  qualifyingHome: 'no',
  complexity: 'none',
};
test('estate below and at the basic allowance has no illustrated liability', () => {
  for (const savings of [0, 324999, 325000])
    assert.equal(calculateIht({ ...valid, savings }).tax, 0);
});
test('basic allowance and rate apply to the excess', () =>
  assert.equal(calculateIht({ ...valid, savings: 500000 }).tax, 70000));
test('qualifying home can increase the total allowance to £500,000', () => {
  const r = calculateIht({
    ...valid,
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 400000,
    savings: 200000,
  });
  assert.equal(r.residenceBand, 175000);
  assert.equal(r.tax, 40000);
});
test('residence allowance is capped by net qualifying home interest', () => {
  const r = calculateIht({
    ...valid,
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 150000,
    homeMortgage: 50000,
    savings: 500000,
  });
  assert.equal(r.residenceBand, 100000);
  assert.equal(r.estate, 600000);
  assert.equal(r.tax, 70000);
});
test('home going to non-descendants does not receive a residence allowance', () => {
  const r = calculateIht({ ...valid, home: 500000 });
  assert.equal(r.residenceBand, 0);
  assert.equal(r.tax, 70000);
});
test('residence allowance tapers on net estate before allowances', () => {
  const r = calculateIht({
    ...valid,
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 500000,
    savings: 1600000,
  });
  assert.equal(r.residenceBand, 125000);
  assert.equal(r.tax, 660000);
});
test('residence taper is zero at £2m and fully removes one allowance at £2.35m', () => {
  for (const [total, band] of [
    [2000000, 175000],
    [2350000, 0],
  ])
    assert.equal(
      calculateIht({
        ...valid,
        beneficiaries: 'descendants',
        qualifyingHome: 'yes',
        home: 500000,
        savings: total - 500000,
      }).residenceBand,
      band,
    );
});
test('confirmed survivor allowances apply, not an automatic couple allowance', () => {
  const r = calculateIht({
    ...valid,
    scenario: 'survivor',
    transferNrb: '100',
    transferRnrb: '100',
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 600000,
    savings: 500000,
  });
  assert.equal(r.nilRateBand, 650000);
  assert.equal(r.residenceBand, 350000);
  assert.equal(r.tax, 40000);
  assert.equal(calculateIht({ ...valid, scenario: 'survivor', savings: 1000000 }).tax, 270000);
});
test('partial transfer is modelled separately for each allowance', () => {
  const r = calculateIht({
    ...valid,
    scenario: 'survivor',
    transferNrb: '50',
    transferRnrb: '0',
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 500000,
    savings: 300000,
  });
  assert.equal(r.nilRateBand, 487500);
  assert.equal(r.residenceBand, 175000);
  assert.equal(r.tax, 55000);
});
test('all-to-qualifying-spouse exemption is not mistaken for taxable first-death inheritance', () => {
  const r = calculateIht({ ...valid, beneficiaries: 'spouse', home: 500000, savings: 1000000 });
  assert.equal(r.exempt, 1500000);
  assert.equal(r.tax, 0);
});
test('unclear beneficiaries, residence or specialist factors withhold estimate', () => {
  for (const change of [
    { beneficiaries: 'mixed' },
    { beneficiaries: 'unsure' },
    { residence: 'unsure' },
    { residence: 'other' },
    { complexity: 'yes' },
    { complexity: 'unsure' },
    { home: 300000, beneficiaries: 'descendants', qualifyingHome: 'unsure' },
  ]) {
    const r = calculateIht({ ...valid, savings: 900000, ...change });
    assert.equal(r.tax, null);
    assert.ok(r.reasons.length > 0);
  }
});
test('unverified transferred allowances need review', () =>
  assert.equal(calculateIht({ ...valid, scenario: 'survivor', transferNrb: 'unsure' }).tax, null));
test('pensions are not silently excluded and future change is not applied early', () => {
  assert.equal(calculateIht({ ...valid, pensions: 300000, savings: 500000 }).tax, null);
  assert.equal(
    calculateIht({
      ...valid,
      pensions: 300000,
      pensionTreatment: 'confirmed-excluded',
      savings: 500000,
    }).tax,
    70000,
  );
  assert.equal(
    calculateIht({
      ...valid,
      pensions: 300000,
      pensionTreatment: 'confirmed-excluded',
      date: '2027-04-06',
    }).tax,
    null,
  );
});
test('effective-date boundaries are explicit', () => {
  assert.equal(calculateIht({ ...valid, date: IHT_RULES.from }).needsReview, false);
  assert.equal(calculateIht({ ...valid, date: IHT_RULES.to }).needsReview, false);
  assert.equal(calculateIht({ ...valid, date: '2026-04-05' }).needsReview, true);
});
test('invalid amounts and dates fail intentionally', () => {
  for (const savings of [-1, NaN, Infinity, 1e9 + 1, 0.001, '400000'])
    assert.throws(() => validateIht({ ...valid, savings }));
  for (const date of ['2026-02-30', 'bad', '2026-9-8'])
    assert.throws(() => validateIht({ ...valid, date }));
  assert.throws(() => validateIht({ ...valid, home: 100, homeMortgage: 101 }));
});
test('insolvent estate is flagged and invalid selections rejected', () => {
  assert.equal(calculateIht({ ...valid, debts: 5000 }).tax, null);
  assert.throws(() => calculateIht({ ...valid, beneficiaries: 'made-up' }));
});

// ---------------------------------------------------------------------------
// Married couple / civil partners: estimate after both deaths
// ---------------------------------------------------------------------------
const couple = {
  ...valid,
  scenario: 'couple',
  beneficiaries: 'descendants',
  qualifyingHome: 'yes',
  firstDeathPassing: 'all-to-spouse',
  largerEstateOver2m: 'no',
};
test('couple brief case 1: £1m net estate with qualifying home → £0', () => {
  const r = calculateIht({ ...couple, home: 600000, savings: 400000 });
  assert.equal(r.estate, 1000000);
  assert.equal(r.nilRateBand, 650000);
  assert.equal(r.residenceBand, 350000);
  assert.equal(r.totalAllowances, 1000000);
  assert.equal(r.residenceTaperLoss, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.heading, COUPLE_HEADING);
  assert.equal(r.explanation, COUPLE_EXPLANATION);
});
test('couple brief case 2: £1.5m net estate with qualifying home → £200,000', () => {
  const r = calculateIht({ ...couple, home: 700000, savings: 800000 });
  assert.equal(r.totalAllowances, 1000000);
  assert.equal(r.taxable, 500000);
  assert.equal(r.tax, 200000);
});
test('couple brief case 3: £1m net estate, no qualifying home → £140,000', () => {
  for (const change of [
    { beneficiaries: 'others', qualifyingHome: 'no' },
    { beneficiaries: 'descendants', qualifyingHome: 'no' },
    { home: 0, savings: 1000000, qualifyingHome: 'no' },
  ]) {
    const r = calculateIht({ ...couple, home: 600000, savings: 400000, ...change });
    assert.equal(r.nilRateBand, 650000);
    assert.equal(r.residenceBand, 0);
    assert.equal(r.tax, 140000);
  }
});
test('couple brief case 4: £2.2m → residence allowance £250,000, IHT £520,000', () => {
  const r = calculateIht({ ...couple, home: 800000, savings: 1400000 });
  assert.equal(r.estate, 2200000);
  assert.equal(r.residenceBand, 250000);
  assert.equal(r.residenceTaperLoss, 100000);
  assert.equal(r.totalAllowances, 900000);
  assert.equal(r.tax, 520000);
});
test('couple brief case 5: £2.7m → residence allowance £0, IHT £820,000', () => {
  const r = calculateIht({ ...couple, home: 1000000, savings: 1700000 });
  assert.equal(r.residenceBand, 0);
  assert.equal(r.residenceTaperLoss, 350000);
  assert.equal(r.totalAllowances, 650000);
  assert.equal(r.tax, 820000);
});
test('couple taper threshold is not doubled: tapering starts above £2m, not £4m', () => {
  assert.equal(calculateIht({ ...couple, home: 800000, savings: 1200000 }).residenceBand, 350000);
  assert.equal(calculateIht({ ...couple, home: 800000, savings: 1200002 }).residenceBand, 349999);
});
test('couple low home equity caps the residence allowance at the net home value', () => {
  const r = calculateIht({ ...couple, home: 300000, homeMortgage: 150000, savings: 850000 });
  assert.equal(r.estate, 1000000);
  assert.equal(r.residenceBand, 150000);
  assert.equal(r.residenceTaperLoss, 0, 'home-value cap is not taper loss');
  assert.equal(r.tax, 80000);
});
test('couple low home equity with tapering reports only the taper that actually bites', () => {
  // Estate £2.2m: tapered maximum £250k, but home equity is only £200k → no allowance lost to taper.
  const r = calculateIht({ ...couple, home: 400000, homeMortgage: 200000, savings: 2000000 });
  assert.equal(r.residenceBand, 200000);
  assert.equal(r.residenceTaperLoss, 0);
});
test('first-death tapering reduces the residence allowance available to transfer', () => {
  // Larger partner £2.1m dies first: taper £50k → only £125k of £175k transfers (71.4%).
  const r = calculateIht({
    ...couple,
    largerEstateOver2m: 'yes',
    largerEstate: 2100000,
    home: 1000000,
    savings: 1100000,
  });
  assert.equal(r.needsReview, false);
  // Survivor: £175k + £125k = £300k, tapered by (£2.1m − £2m) / 2 = £50k → £250k.
  assert.equal(r.residenceBand, 250000);
  assert.equal(r.residenceTaperLoss, 100000);
  assert.equal(r.tax, Math.round((2100000 - 650000 - 250000) * 0.4));
  assert.ok(r.assumptions.some((a) => a.includes('reduces the residence allowance available')));
  // Larger estate of £2.35m+ removes the whole transferable residence allowance.
  const none = calculateIht({
    ...couple,
    largerEstateOver2m: 'yes',
    largerEstate: 2350000,
    home: 1000000,
    savings: 1400000,
  });
  assert.equal(none.residenceBand, 0);
});
test('couple scenario never awards allowances just because "married" is selected', () => {
  const bare = calculateIht({ ...EMPTY_IHT, scenario: 'couple', savings: 1000000 });
  assert.equal(bare.needsReview, true);
  assert.equal(bare.tax, null);
  assert.equal(bare.nilRateBand, null);
});
test('uncertain or unsupported couple answers are flagged rather than assumed', () => {
  for (const change of [
    { firstDeathPassing: 'unsure' },
    { firstDeathPassing: 'other' },
    { firstDeathPassing: 'na' },
    { largerEstateOver2m: 'unsure' },
    { largerEstateOver2m: 'yes', largerEstate: 1500000 },
    { largerEstateOver2m: 'yes', largerEstate: 3000000 },
    { largerEstateOver2m: 'no', savings: 4000000 },
    { complexity: 'unsure' },
    { complexity: 'yes' },
    { residence: 'unsure' },
    { residence: 'other' },
    { beneficiaries: 'spouse' },
    { beneficiaries: 'mixed' },
    { qualifyingHome: 'unsure' },
    { transferNrb: '100' },
    { pensions: 100000 },
  ]) {
    const r = calculateIht({ ...couple, home: 600000, savings: 900000, ...change });
    assert.equal(r.tax, null, JSON.stringify(change));
    assert.equal(r.residenceBand, null);
    assert.ok(r.reasons.length > 0);
  }
});
test('surviving spouse keeps separate confirmed percentages for each allowance', () => {
  const base = {
    ...valid,
    scenario: 'survivor',
    beneficiaries: 'descendants',
    qualifyingHome: 'yes',
    home: 500000,
    savings: 500000,
  };
  const r = calculateIht({ ...base, transferNrb: '100', transferRnrb: '50' });
  assert.equal(r.nilRateBand, 650000);
  assert.equal(r.residenceBand, 262500);
  assert.equal(r.tax, 35000);
  const none = calculateIht({ ...base, transferNrb: '0', transferRnrb: '0' });
  assert.equal(none.nilRateBand, 325000);
  assert.equal(none.residenceBand, 175000);
  assert.equal(calculateIht({ ...base, transferNrb: '100', transferRnrb: 'unsure' }).tax, null);
});
test('switching scenarios clears inappropriate allowances and couple answers', () => {
  const survivor = {
    ...valid,
    scenario: 'survivor',
    transferNrb: '100',
    transferRnrb: '100',
    savings: 1000000,
  };
  const toIndividual = resetForScenario(survivor, 'individual');
  assert.equal(toIndividual.transferNrb, '0');
  assert.equal(toIndividual.transferRnrb, '0');
  assert.equal(calculateIht(toIndividual).nilRateBand, 325000);
  const toCouple = resetForScenario(survivor, 'couple');
  assert.equal(toCouple.transferNrb, '0');
  assert.equal(toCouple.firstDeathPassing, 'unsure');
  assert.equal(toCouple.largerEstateOver2m, 'unsure');
  assert.equal(calculateIht(toCouple).tax, null, 'a fresh couple journey must be answered first');
  const answeredCouple = { ...couple, largerEstateOver2m: 'yes', largerEstate: 2500000 };
  const backToIndividual = resetForScenario(answeredCouple, 'individual');
  assert.equal(backToIndividual.firstDeathPassing, 'na');
  assert.equal(backToIndividual.largerEstateOver2m, 'na');
  assert.equal(backToIndividual.largerEstate, 0);
  const toSurvivor = resetForScenario(answeredCouple, 'survivor');
  assert.equal(toSurvivor.transferNrb, '0');
  assert.equal(toSurvivor.transferRnrb, '0');
  assert.equal(
    resetForScenario({ ...valid, beneficiaries: 'spouse' }, 'couple').beneficiaries,
    'unsure',
  );
  // Returning to a couple journey re-asks the couple questions.
  assert.equal(resetForScenario(backToIndividual, 'couple').firstDeathPassing, 'unsure');
});
test('validation strips couple-only answers from other scenarios and accepts older inputs', () => {
  const stale = validateIht({
    ...valid,
    firstDeathPassing: 'all-to-spouse',
    largerEstateOver2m: 'yes',
    largerEstate: 2500000,
  });
  assert.equal(stale.firstDeathPassing, 'na');
  assert.equal(stale.largerEstate, 0);
  const { firstDeathPassing: _f, largerEstateOver2m: _l, largerEstate: _v, ...legacy } =
    valid;
  assert.equal(calculateIht({ ...legacy, savings: 500000 }).tax, 70000);
});
test('shared summary contains every required line for screen and PDF', () => {
  const r = calculateIht({ ...couple, home: 800000, savings: 1400000 });
  const rows = Object.fromEntries(ihtSummary(r).map((row) => [row.key, row]));
  assert.equal(rows.scenario.value, SCENARIO_LABELS.couple);
  assert.equal(rows.assets.value, '£2,200,000');
  assert.equal(rows.liabilities.value, '£0');
  assert.equal(rows.estate.value, '£2,200,000');
  assert.equal(rows.nrb.value, '£650,000');
  assert.equal(rows.rnrb.value, '£250,000');
  assert.equal(rows.taper.value, '£100,000');
  assert.equal(rows.allowances.value, '£900,000');
  assert.equal(rows.taxable.value, '£1,300,000');
  assert.equal(rows.tax.value, '£520,000');
  assert.equal(rows.tax.label, 'Estimated IHT after both deaths');
  assert.ok(rows.date && rows.rules);
  const review = ihtSummary(calculateIht({ ...couple, firstDeathPassing: 'unsure' }));
  assert.equal(review.find((row) => row.key === 'tax').value, 'Adviser review needed');
});
