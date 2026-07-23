import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { API, SAMPLE_LEAVE } from '../../src/data/test-data';

test.describe('Leave Management', () => {
  test('LEAVE-01: Hiển thị số dư nghỉ phép (Leave Balance)', async ({ page, leavePage }) => {
    await annotate({ module: 'LEAVE', severity: 'normal', tags: ['regression'] });

    await test.step('Vào trang Leave', async () => {
      await leavePage.goto();
      await expect(page).toHaveURL(/\/leave/);
      await expect(leavePage.pageTitle).toHaveText('Leave Management');
    });

    await test.step('Đợi balance load', async () => {
      await leavePage.waitForBalance();
    });

    await test.step('Assert 4 thẻ balance (Annual, Sick, Personal, Remote)', async () => {
      await expect(leavePage.balanceCards).toHaveCount(4);
    });
  });

  test('LEAVE-04: Submit form thành công', async ({ page, leavePage }) => {
    await annotate({ module: 'LEAVE', severity: 'critical', tags: ['regression'] });

    await test.step('Vào trang Leave, mở modal', async () => {
      await leavePage.goto();
      await leavePage.openNewRequestModal();
    });

    await test.step('Điền form đầy đủ', async () => {
      await leavePage.fillForm(SAMPLE_LEAVE);
    });

    await test.step('Click Submit (POST /api/leave)', async () => {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(API.leave) && r.request().method() === 'POST'),
        leavePage.submit(),
      ]);
      expect(response.ok()).toBeTruthy();
    });

    await test.step('Assert toast thành công', async () => {
      await expect(leavePage.toastSuccess).toBeVisible();
    });
  });
});
