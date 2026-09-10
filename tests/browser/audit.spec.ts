import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { pageCatalog } from '../../lib/seo';
const require = createRequire(import.meta.url);

for (const width of [320, 768, 1440]) {
  test(`all pages: accessibility, images and layout at ${width}px`, async ({ page }) => {
    test.setTimeout(600000);
    await page.setViewportSize({ width, height: 900 });
    const findings: unknown[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await mkdir('artifacts', { recursive: true });
    for (const entry of pageCatalog) {
      const path = '/' + entry.path;
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1'), path).toHaveCount(1);
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => {})));
        window.scrollTo(0, 0);
      });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: Array.from(document.images).filter(img => !img.complete || !img.naturalWidth).map(img => img.src),
        clippedText: Array.from(document.querySelectorAll('h1,h2,h3,p,label,button,a')).filter(el => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (!rect.width || !rect.height || el.closest('[aria-hidden="true"],.sr-only') || style.visibility === 'hidden') return false;
          return rect.left < -2 || rect.right > innerWidth + 2;
        }).map(el => ({ text: el.textContent?.trim().slice(0, 100), class: el.className })),
      }));
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const accessibility = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
        return result.violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n: any) => ({ target: n.target, summary: n.failureSummary })) }));
      });
      if (layout.overflow || layout.brokenImages.length || layout.clippedText.length || accessibility.length) findings.push({ path, layout, accessibility });
      if (['', 'meet-sim', 'book-review', 'iht-calculator', 'estate-planning/wills', 'privacy'].includes(entry.path)) {
        await page.screenshot({ path: `artifacts/audit-${width}-${entry.path.replaceAll('/', '-') || 'home'}.png`, fullPage: true });
      }
    }
    await writeFile(`artifacts/audit-${width}.json`, JSON.stringify({ findings, errors }, null, 2));
    expect(errors).toEqual([]);
    expect(findings, `See artifacts/audit-${width}.json`).toEqual([]);
  });
}

test('short mobile navigation can scroll to the review link and dismiss with Escape', async ({ page }) => {
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
