import { test, expect } from '@playwright/test';

test('the mobile family check gives prompts before collecting contact details and preserves attribution', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 780 });
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/enquiry', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      json: { delivery: 'sent', reference: 'family-test' },
    });
  });

  await page.goto('/?utm_source=instagram&utm_campaign=family');
  await page
    .getByRole('link', { name: 'Start My Family Wealth Check' })
    .click();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel('Where are you based?').selectOption('Wales');
  await page.getByLabel('What prompted this?').selectOption('New mortgage');
  await page.getByLabel('Wills', { exact: true }).check();
  await page.getByLabel('Protection', { exact: true }).check();
  await page.getByLabel('When do you want to act?').selectOption('Exploring');
  await page.getByLabel('Own home', { exact: true }).check();
  await page
    .getByLabel(/Are you open to a proposal/)
    .selectOption('Information only');
  await page.getByRole('button', { name: 'See my discussion prompts' }).click();
  await expect(
    page.getByRole('heading', { name: 'Topics worth discussing' }),
  ).toBeVisible();
  expect(submitted).toBeUndefined();
  await expect(page).toHaveURL(/\/family-wealth-check$/);

  await page.getByLabel('Your name', { exact: true }).fill('Family visitor');
  await page
    .getByLabel('Email address', { exact: true })
    .fill('family@example.com');
  await page.getByLabel(/How did you hear about me/).fill('A friend');
  await page
    .getByRole('button', { name: 'Request Your Financial & Estate Review' })
    .click();
  await expect(page.getByRole('status')).toContainText('family-test');
  expect(submitted).toMatchObject({
    review: {
      audience: 'family',
      location: ['Wales'],
      needs: ['Wills', 'Protection'],
    },
    firstCampaign: { utm_source: 'instagram', utm_campaign: 'family' },
    referral: 'A friend',
    marketingEmail: false,
  });
  await expect(
    page.getByRole('link', { name: 'Choose an appointment time' }),
  ).toHaveCount(0);
});

test('an agent can ask for a private introduction without entering client information', async ({
  page,
}) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/enquiry', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      json: { delivery: 'sent', reference: 'agent-test' },
    });
  });

  await page.goto('/footballers-and-sports-professionals');
  await page.getByRole('link', { name: 'I’m an agent or adviser' }).click();
  const form = page.locator('#agent-introduction');
  await form.getByLabel('Where are you based?').selectOption('England');
  await form
    .getByLabel('What prompted this?')
    .selectOption('Football career change');
  await form.getByLabel('Initial fit conversation', { exact: true }).check();
  await form.getByLabel('When do you want to act?').selectOption('Now');
  await form.getByLabel('Solicitor', { exact: true }).check();
  await form
    .getByLabel(/Are you open to a proposal/)
    .selectOption('Explain the process');
  await form.getByRole('button', { name: 'See my discussion prompts' }).click();
  await form.getByLabel('Your name', { exact: true }).fill('Agent visitor');
  await form
    .getByLabel('Email address', { exact: true })
    .fill('agent@example.com');
  await form
    .getByRole('button', { name: 'Request an agent introduction' })
    .click();
  await expect(form.getByRole('status')).toContainText('agent-test');
  expect(submitted?.review).toMatchObject({
    audience: 'agent',
    needs: ['Initial fit conversation'],
    circumstances: ['Solicitor'],
  });
});
