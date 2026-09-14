import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { pageCatalog } from '../../lib/seo';
import type { AxeResults } from 'axe-core';
const require = createRequire(import.meta.url);
test.use({ trace: 'off' });

for (const width of [320, 768, 1440, 1920]) {
  test(`all pages: accessibility, images and layout at ${width}px`, async ({ page }) => {
    test.setTimeout(600000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const findings: unknown[] = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mkdir('artifacts', { recursive: true });
    for (const entry of pageCatalog) {
      const path = '/' + entry.path;
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1'), path).toHaveCount(1);
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
        window.scrollTo(0, 0);
      });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: Array.from(document.images)
          .filter((img) => !img.complete || !img.naturalWidth)
          .map((img) => img.src),
        clippedText: Array.from(document.querySelectorAll('h1,h2,h3,p,label,button,a'))
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            if (
              !rect.width ||
              !rect.height ||
              el.closest('[aria-hidden="true"],.sr-only') ||
              style.visibility === 'hidden'
            )
              return false;
            return rect.left < -2 || rect.right > innerWidth + 2;
          })
          .map((el) => ({ text: el.textContent?.trim().slice(0, 100), class: el.className })),
      }));
      if (width === 1440) {
        const internalLinks = await page
          .locator('a[href]')
          .evaluateAll((links) =>
            links
              .map((link) => (link as HTMLAnchorElement).href)
              .filter((href) => href.startsWith(location.origin)),
          );
        const routes = new Set(pageCatalog.map((p) => '/' + p.path));
        for (const href of internalLinks) {
          const url = new URL(href);
          expect(routes.has(url.pathname), path + ' links to ' + href).toBe(true);
          if (url.hash && url.pathname === new URL(page.url()).pathname) {
            expect(
              await page.evaluate(
                (id) => !!document.getElementById(id),
                decodeURIComponent(url.hash.slice(1)),
              ),
              href,
            ).toBe(true);
          }
        }
      }
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const accessibility = await page.evaluate(async () => {
        const result: AxeResults = await (
          window as unknown as { axe: typeof import('axe-core') }
        ).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        }));
      });
      if (
        layout.overflow ||
        layout.brokenImages.length ||
        layout.clippedText.length ||
        accessibility.length
      )
        findings.push({ path, layout, accessibility });
      if (
        [
          '',
          'meet-sim',
          'book-review',
          'iht-calculator',
          'estate-planning/wills',
          'privacy',
        ].includes(entry.path)
      ) {
        await page.screenshot({
          path: `artifacts/audit-${width}-${entry.path.replaceAll('/', '-') || 'home'}.png`,
          fullPage: true,
        });
      }
    }
    await writeFile(`artifacts/audit-${width}.json`, JSON.stringify({ findings, errors }, null, 2));
    expect(errors).toEqual([]);
    expect(findings.length, `See artifacts/audit-${width}.json`).toBe(0);
  });
}

test('short mobile navigation can scroll to the review link and dismiss with Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const review = dialog.getByRole('link', { name: 'Book Your Financial & Estate Review' });
  await review.scrollIntoViewIfNeeded();
  await expect(review).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('an unexpected successful HTTP response never becomes a false delivery confirmation', async ({
  page,
}) => {
  await page.route('**/api/enquiry', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
  await page.goto('/book-review');
  await page.getByLabel('Your name', { exact: true }).fill('Audit visitor');
  await page.getByLabel('Email address', { exact: true }).fill('audit@example.com');
  await page.getByRole('button', { name: 'Request Your Financial & Estate Review' }).click();
  await expect(page.locator('.enquiry-form').getByRole('alert')).toContainText(
    'Delivery could not be confirmed',
  );
  await expect(page.getByLabel('Your name', { exact: true })).toHaveValue('Audit visitor');
});
