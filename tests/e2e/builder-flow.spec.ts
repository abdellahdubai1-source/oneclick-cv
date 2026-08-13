import { test, expect } from '@playwright/test';

/**
 * End-to-end coverage of the core "create a CV from zero → download" flow
 * (spec §26 "CV Tests" / "Export and Device Tests"). Run with:
 *   npm run test:e2e
 * (requires `npm run build` to succeed first — the Playwright config does
 * this automatically via `webServer`).
 */

test.describe('CV Builder core flow', () => {
  test('landing page has working primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /create a cv that gets you noticed/i })).toBeVisible();
    await page.getByRole('link', { name: 'Create My CV' }).first().click();
    await expect(page).toHaveURL(/\/builder/);
  });

  test('can fill personal details and see the live preview update', async ({ page }) => {
    await page.goto('/builder');
    await page.getByLabel(/full name/i).fill('Fatima Al Mansoori');
    await page.getByLabel(/professional title/i).first().fill('Senior Marketing Executive');
    await page.getByLabel(/uae phone number/i).fill('+971501234567');
    await page.getByLabel(/email address/i).fill('fatima@example.com');
    await page.getByLabel(/current city/i).fill('Dubai');

    // Live preview (desktop) should reflect the name without a page reload.
    await expect(page.locator('#cv-preview-surface')).toContainText('Fatima Al Mansoori');
  });

  test('can add a work experience entry without losing personal details', async ({ page }) => {
    await page.goto('/builder');
    await page.getByLabel(/full name/i).fill('Ahmed Khan');
    await page.getByRole('button', { name: /continue/i }).click(); // -> summary
    await page.getByRole('button', { name: /continue/i }).click(); // -> experience

    await page.getByRole('button', { name: '+ Add role' }).first().click();
    await page.getByLabel(/job title/i).first().fill('Software Engineer');
    await page.getByLabel(/company name/i).first().fill('Acme Tech');

    // Go back to personal details and confirm the name is still there.
    await page.getByRole('button', { name: /personal details/i }).click();
    await expect(page.getByLabel(/full name/i)).toHaveValue('Ahmed Khan');
  });

  test('switching templates preserves entered data', async ({ page }) => {
    await page.goto('/builder');
    await page.getByLabel(/full name/i).fill('Layla Hassan');

    await page.getByRole('button', { name: /^template$/i }).click();
    await page.getByRole('button', { name: /modern professional/i }).click();
    await expect(page.locator('#cv-preview-surface')).toContainText('Layla Hassan');

    await page.getByRole('button', { name: /minimal ats/i }).click();
    await expect(page.locator('#cv-preview-surface')).toContainText('Layla Hassan');
  });

  test('mobile viewport shows Edit/Preview tabs instead of a squeezed layout', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Only relevant on the mobile project');
    await page.goto('/builder');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible();
  });

  test('ATS checker produces a score from a pasted job description', async ({ page }) => {
    await page.goto('/builder');
    await page.getByRole('button', { name: /^ats & job match$/i }).click();
    await page
      .getByPlaceholder(/paste the full job description here/i)
      .fill(
        'We are hiring a Marketing Executive with experience in Google Analytics, Social Media Marketing and campaign management. Must have 3+ years experience.',
      );
    await page.getByRole('button', { name: 'Analyse match' }).click();
    await expect(page.getByText(/\/ 100/)).toBeVisible();
  });

  test('cover letter generator produces profession-specific text', async ({ page }) => {
    await page.goto('/cover-letter');
    await page.getByLabel(/profession/i).selectOption('cleaning_housekeeping');
    await page.getByLabel(/company name/i).fill('Grand Hotel');
    const preview = page.locator('textarea').last();
    await expect(preview).toContainText(/clean|hygiene|reliab/i);
  });
});
