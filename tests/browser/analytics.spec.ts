import { expect, test } from '@playwright/test';

test('analytics strips query data and honours the visitor preference across page loads', async ({
  page,
}) => {
  await page.route('**/_vercel/insights/script.js', (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await page.goto('/cookies');
  await expect(
    page.locator('script[data-sdkn="@vercel/analytics/next"]'),
  ).toHaveCount(1);

  const filteredUrl = await page.evaluate(() => {
    const { vaq } = window as unknown as {
      vaq: Array<
        [
          string,
          (event: { type: 'pageview'; url: string }) => { url: string } | null,
        ]
      >;
    };
    const beforeSend = vaq.find(([name]) => name === 'beforeSend')?.[1];
    return beforeSend?.({
      type: 'pageview',
      url: location.origin + '/book-review?email=test@example.com#example',
    })?.url;
  });
  expect(filteredUrl).toBe('http://127.0.0.1:4173/book-review');

  await page
    .getByRole('button', { name: 'Turn off website analytics' })
    .click();
  await expect(page.getByRole('status')).toContainText('Website analytics off');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Turn on website analytics' }),
  ).toBeVisible();
  await expect(
    page.locator('script[data-sdkn="@vercel/analytics/next"]'),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Turn on website analytics' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Website analytics allowed',
  );
  await expect(
    page.locator('script[data-sdkn="@vercel/analytics/next"]'),
  ).toHaveCount(1);
});
