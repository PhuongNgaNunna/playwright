import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { SCREENSHOT_OPTIONS, clearAuthAndReload, dashboardMasks } from '../../src/utils/VisualCompare';

test.describe('Visual regression', () => {
  test('VIS-01: Visual snapshot trang Login (chưa login) @smoke', async ({ page }) => {
    await annotate({ module: 'VISUAL', severity: 'normal', tags: ['smoke'] });

    await test.step('Mở trang login (clear session)', async () => {
      // This project loads the admin storageState; clear it so the logged-out
      // login screen is what gets captured.
      await clearAuthAndReload(page, '/login');
    });

    await test.step('Đợi load hoàn tất', async () => {
      await page.waitForLoadState('networkidle');
      await expect(page.getByTestId('login-form')).toBeVisible();
    });

    await test.step('Chụp và so sánh', async () => {
      await expect(page).toHaveScreenshot('login-page.png', SCREENSHOT_OPTIONS);
    });
  });

  test('VIS-02: Visual snapshot Dashboard Admin (mask stat động)', async ({ page, dashboardPage }) => {
    await annotate({ module: 'VISUAL', severity: 'normal', tags: ['regression'] });

    await test.step('Đợi Dashboard load hoàn tất', async () => {
      await dashboardPage.goto();
      await dashboardPage.waitForReady();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Chụp và so sánh (mask phần tử động)', async () => {
      await expect(page).toHaveScreenshot('dashboard-admin.png', {
        ...SCREENSHOT_OPTIONS,
        mask: dashboardMasks(page),
      });
    });
  });
});
