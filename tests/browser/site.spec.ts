import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import services from '../../lib/services.json' with { type: 'json' };
const calculator = {
  date: '2026-09-08',
  scenario: 'individual',
  residence: 'straightforward-uk',
  beneficiaries: 'others',
  home: 0,
  homeMortgage: 0,
  savings: 500000,
  investments: 0,
  otherAssets: 0,
  debts: 0,
  pensions: 0,
  qualifyingHome: 'no',
  transferNrb: '0',
  transferRnrb: '0',
  pensionTreatment: 'none',
  complexity: 'none',
};
const lead = () => ({
  requestId: randomUUID(),
  name: 'Preview Visitor',
  email: 'preview@example.com',
  phone: '',
  interest: 'IHT report',
  contactMethod: 'email',
  message: '',
  marketingEmail: false,
  callback: false,
  website: '',
});
test('desktop and mobile homepage render without overflow and primary paths work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Your wealth.');
  await expect(
    page.getByRole('link', { name: 'Book Your Financial & Estate Review', exact: true }).first(),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
    'Anton',
  );
  expect(await page.evaluate(() => document.fonts.check('400 32px "Anton"'))).toBe(true);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'artifacts/home-desktop-viewport.png' });
  await page.getByRole('button', { name: 'How I Help', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Estate Planning' }).click();
  await expect(page).toHaveURL(/estate-planning$/);
  await page.screenshot({ path: 'artifacts/estate-planning-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  await page.screenshot({ path: 'artifacts/home-mobile-viewport.png' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'IHT calculator' })
    .click();
  await expect(page).toHaveURL(/iht-calculator$/);
  await page.screenshot({ path: 'artifacts/calculator-mobile-start.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('all service routes and requested content pages respond with meaningful headings', async ({
  request,
}) => {
  for (const s of services) {
    const response = await request.get('/' + s.pillar + '/' + s.slug);
    expect(response.status(), s.slug).toBe(200);
    expect(await response.text()).toContain(s.title);
  }
  for (const route of [
    'the-plan',
    'meet-sim',
    'contact',
    'book-review',
    'insights',
    'case-studies',
    'privacy',
    'cookies',
    'terms',
    'complaints',
    'accessibility',
    'regulatory-information',
  ])
    expect((await request.get('/' + route)).status(), route).toBe(200);
  expect((await request.get('/not-a-real-page')).status()).toBe(404);
});
test('review form saves a request without marketing consent and never claims a confirmed appointment', async ({
  page,
}) => {
  await page.goto('/book-review');
  await page.getByLabel('Your name', { exact: true }).fill('Preview Visitor');
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.com');
  await page.getByRole('button', { name: 'Request Your Financial & Estate Review' }).click();
  await expect(page.getByRole('heading', { name: /Your review request/ })).toBeVisible();
  await expect(
    page.getByText(
      'This is a private preview. Adviser email notifications are not connected, so please use sample details. To contact Sim now, use the Instagram profile below.',
    ),
  ).toBeVisible();
});
test('calculator can be completed from its visible controls and downloads a PDF', async ({
  page,
}) => {
  await page.goto('/iht-calculator');
  async function choose(label: string, option: string) {
    await page.getByRole('combobox', { name: label, exact: true }).click();
    await page.getByRole('option', { name: option, exact: true }).click();
  }
  await choose(
    'Does the straightforward UK residence scenario apply?',
    'Yes — this straightforward scenario applies',
  );
  await choose('Who receives the estate outright?', 'Other people (no exempt beneficiaries)');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Cash and savings', { exact: true }).fill('500000');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await choose('Does a qualifying home pass outright to direct descendants?', 'No');
  await choose('Are there any specialist circumstances?', 'None of these apply');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name', { exact: true }).fill('Preview Visitor');
  await page.getByLabel('Email address', { exact: true }).fill('preview@example.com');
  await page.getByRole('button', { name: 'Create My IHT Report' }).click();
  await expect(page.locator('.result-amount strong')).toHaveText('£70,000');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download your report' }).click();
  const download = await downloadPromise;
  await download.saveAs('artifacts/sample-iht-report.pdf');
  await page.screenshot({ path: 'artifacts/calculator-result.png', fullPage: true });
});
test('report API preserves estimates, supports retries, rejects cross-origin and handles complex scenarios', async ({
  request,
}) => {
  const person = lead();
  const response = await request.post('/api/report', { data: { lead: person, calculator } });
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(result.result.tax).toBe(70000);
  expect(Buffer.from(result.pdf, 'base64').subarray(0, 5).toString()).toBe('%PDF-');
  expect(result.delivery).toBe('not-configured');
  const retry = await request.post('/api/report', { data: { lead: person, calculator } });
  expect(retry.status()).toBe(200);
  const retried = await retry.json();
  expect(retried.reference).toBe(result.reference);
  expect(retried.pdf).toBe(result.pdf);
  const callback = await request.post('/api/report', {
    data: {
      lead: { ...lead(), callback: true, contactMethod: 'phone', phone: '07700 900123' },
      calculator,
    },
  });
  expect(callback.status()).toBe(200);
  expect((await callback.json()).callbackDelivery).toBe('not-configured');
  const complex = await request.post('/api/report', {
    data: { lead: lead(), calculator: { ...calculator, complexity: 'yes' } },
  });
  expect(complex.status()).toBe(200);
  expect((await complex.json()).result.tax).toBe(null);
  const invalid = await request.post('/api/report', {
    data: { lead: lead(), calculator: { ...calculator, savings: -1 } },
  });
  expect(invalid.status()).toBe(400);
  const cross = await request.post('/api/enquiry', {
    headers: { Origin: 'https://other.example' },
    data: lead(),
  });
  expect(cross.status()).toBe(400);
  const maintenance = await request.post('/api/maintenance');
  expect(maintenance.status()).toBe(401);
});
