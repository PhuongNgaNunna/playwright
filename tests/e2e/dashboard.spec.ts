import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';

test.describe('Dashboard', () => {
  test('DASH-01: Dashboard hiển thị stat cards @smoke', async ({ dashboardPage }) => {
    await annotate({ module: 'DASH', severity: 'normal', tags: ['smoke'] });

    await test.step('Đợi Dashboard load', async () => {
      await dashboardPage.goto();
      await dashboardPage.waitForReady();
    });

    await test.step('Assert có >= 4 stat cards', async () => {
      // The 4th card being visible proves at least four cards rendered.
      await expect(dashboardPage.statCards.nth(3)).toBeVisible();
      expect(await dashboardPage.statCards.count()).toBeGreaterThanOrEqual(4);
    });
  });

  test('DASH-02: Dashboard Employee chỉ hiện stats cá nhân', async ({ page, dashboardPage }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'employee-chromium',
      'DASH-02 chỉ áp dụng cho role employee',
    );
    await annotate({ module: 'DASH', severity: 'critical', tags: ['regression'] });

    await test.step('Đợi Dashboard load', async () => {
      await dashboardPage.goto();
      await dashboardPage.waitForReady();
    });

    await test.step('Assert "My Approved Leaves" hiển thị', async () => {
      await expect(page.getByText('My Approved Leaves')).toBeVisible();
    });

    await test.step('Assert "My Open Tasks" hiển thị', async () => {
      await expect(page.getByText('My Open Tasks')).toBeVisible();
    });

    await test.step('Assert KHÔNG hiện "Total Employees"', async () => {
      await expect(page.getByText('Total Employees')).toHaveCount(0);
    });
  });
});
