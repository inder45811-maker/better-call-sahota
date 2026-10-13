import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateIht, validateIht, EMPTY_IHT } from '../lib/iht.ts';
import { makeReport, pdfBase64 } from '../lib/report.ts';
import { PDFDocument } from 'pdf-lib';

void test('makeReport generates a valid 3-page PDF matching the design for review scenario', async () => {
  const input = {
    ...EMPTY_IHT,
    date: '2026-10-03',
    scenario: 'individual',
    residence: 'unsure',
    beneficiaries: 'unsure',
    home: 1000000,
    homeMortgage: 0,
    savings: 100000,
    investments: 0,
    otherAssets: 0,
    debts: 0,
    pensions: 0,
    qualifyingHome: 'unsure',
    transferNrb: '0',
    transferRnrb: '0',
    pensionTreatment: 'none',
    complexity: 'unsure',
  };

  const result = calculateIht(validateIht(input));
  assert.equal(result.needsReview, true);
  assert.equal(result.estate, 1100000);

  const createdAt = Date.parse('2026-10-03T12:00:00Z');
  const bytes = await makeReport('Simran', result, createdAt);

  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 10000, 'PDF should have reasonable size');

  const pdfDoc = await PDFDocument.load(bytes);
  assert.equal(pdfDoc.getPageCount(), 3, 'Must have exactly 3 pages');

  const base64 = pdfBase64(bytes);
  assert.ok(base64.length > 0);
  assert.equal(typeof base64, 'string');
});

void test('makeReport generates a valid 3-page PDF for calculated estimate scenario', async () => {
  const input = {
    ...EMPTY_IHT,
    date: '2026-10-03',
    scenario: 'individual',
    residence: 'straightforward-uk',
    beneficiaries: 'descendants',
    home: 400000,
    homeMortgage: 0,
    savings: 200000,
    investments: 0,
    otherAssets: 0,
    debts: 0,
    pensions: 0,
    qualifyingHome: 'yes',
    transferNrb: '0',
    transferRnrb: '0',
    pensionTreatment: 'none',
    complexity: 'none',
  };

  const result = calculateIht(validateIht(input));
  assert.equal(result.needsReview, false);
  assert.equal(result.tax, 40000);

  const bytes = await makeReport('John Doe', result, Date.now());
  const pdfDoc = await PDFDocument.load(bytes);
  assert.equal(pdfDoc.getPageCount(), 3, 'Must have exactly 3 pages');
});

void test('makeReport generates a valid 3-page PDF for couple scenario with matching figures', async () => {
  const input = {
    ...EMPTY_IHT,
    date: '2026-10-03',
    scenario: 'couple',
    residence: 'straightforward-uk',
    beneficiaries: 'descendants',
    home: 800000,
    homeMortgage: 0,
    savings: 1400000,
    investments: 0,
    otherAssets: 0,
    debts: 0,
    pensions: 0,
    qualifyingHome: 'yes',
    firstDeathPassing: 'all-to-spouse',
    largerEstateOver2m: 'no',
    largerEstate: 0,
    pensionTreatment: 'none',
    complexity: 'none',
  };

  const result = calculateIht(validateIht(input));
  assert.equal(result.needsReview, false);
  assert.equal(result.tax, 520000);
  assert.equal(result.residenceBand, 250000);
  assert.equal(result.residenceTaperLoss, 100000);

  const bytes = await makeReport('Sim & Partner', result, Date.now());
  const pdfDoc = await PDFDocument.load(bytes);
  assert.equal(pdfDoc.getPageCount(), 3, 'Must have exactly 3 pages');
});
