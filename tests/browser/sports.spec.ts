import { test, expect } from '@playwright/test';
test('sports planning links to a contextual private meeting request', async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/enquiry', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ delivery: 'sent', reference: 'sports-test' }),
    });
  });
  await page.goto('/footballers-and-sports-professionals');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Footballers and Sports Professionals',
  );
  await page
    .getByRole('link', { name: 'Book a private planning meeting', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/#private-meeting$/);
  await page.getByLabel('Your name', { exact: true }).fill('Sports test visitor');
  await page.getByLabel('Email address', { exact: true }).fill('sports@example.com');
  await page.getByRole('button', { name: 'Request a private planning meeting' }).click();
  await expect(page.getByRole('status')).toContainText('sports-test');
  expect(submitted?.interest).toBe('Footballers & Sports Professionals');
  expect(submitted?.marketingEmail).toBe(false);
});
