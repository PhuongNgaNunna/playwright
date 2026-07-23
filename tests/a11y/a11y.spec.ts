import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';

/**
 * Bonus — accessibility scan of the Dashboard with axe-core.
 * Runs only in admin-chromium (see playwright.config testMatch). We fail on
 * `critical`-impact violations and attach the full report to Allure for review.
 */
test.describe('Accessibility (bonus)', () => {
  test('A11Y-01: Dashboard không có lỗi accessibility nghiêm trọng', async ({ page, dashboardPage }, testInfo) => {
    await annotate({ module: 'A11Y', severity: 'minor', tags: ['accessibility'] });

    await test.step('Mở Dashboard', async () => {
      await dashboardPage.goto();
      await dashboardPage.waitForReady();
    });

    const results = await test.step('Chạy axe-core scan', async () => {
      return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    });

    await test.step('Đính kèm report + assert không có lỗi critical', async () => {
      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(critical, `critical a11y violations: ${critical.map((v) => v.id).join(', ')}`).toEqual([]);
    });
  });
});
