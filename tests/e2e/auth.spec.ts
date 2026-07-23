import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { admin } from '../../src/data/users';
import { STORAGE_KEYS } from '../../src/data/test-data';

test.describe('Authentication', () => {
  test('AUTH-01: Đăng nhập thành công với Admin @smoke', async ({ page, loginPage, dashboardPage }) => {
    await annotate({ module: 'AUTH', severity: 'critical', tags: ['smoke'] });

    await test.step('Mở trang login', async () => {
      await loginPage.goto();
      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.form).toBeVisible();
    });

    await test.step('Điền credentials Admin', async () => {
      await loginPage.fillCredentials(admin.email, admin.password);
    });

    await test.step('Click Submit', async () => {
      const response = await loginPage.submitAndCaptureLogin();
      expect(response.status()).toBe(200);
    });

    await test.step('Assert điều hướng về Dashboard', async () => {
      await expect(page).toHaveURL(/worknest-site\.netlify\.app\/?$/);
    });

    await test.step('Assert sidebar Admin', async () => {
      await expect(dashboardPage.navAuditLogs).toBeVisible();
    });
  });

  test('AUTH-02: Đăng nhập thất bại với sai mật khẩu @smoke', async ({ page, loginPage }) => {
    await annotate({ module: 'AUTH', severity: 'critical', tags: ['smoke'] });

    await test.step('Mở trang login', async () => {
      await loginPage.goto();
      await expect(loginPage.form).toBeVisible();
    });

    await test.step('Điền email đúng + password sai', async () => {
      await loginPage.fillCredentials(admin.email, 'sai_password');
    });

    await test.step('Click Submit', async () => {
      const response = await loginPage.submitAndCaptureLogin();
      expect(response.status()).toBe(401);
    });

    await test.step('Assert alert lỗi hiển thị', async () => {
      await loginPage.expectError('Invalid');
    });

    await test.step('Assert vẫn ở trang login', async () => {
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test('AUTH-04: Đăng xuất khỏi hệ thống', async ({ page, dashboardPage }) => {
    await annotate({ module: 'AUTH', severity: 'critical', tags: ['regression'] });

    await test.step('Vào Dashboard (storageState)', async () => {
      await dashboardPage.goto();
      await expect(page).toHaveURL(/worknest-site\.netlify\.app\/?$/);
      await expect(dashboardPage.sidebar).toBeVisible();
    });

    await test.step('Click nút Logout', async () => {
      await dashboardPage.logout();
    });

    await test.step('Assert điều hướng về login', async () => {
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Assert localStorage đã clear', async () => {
      const token = await page.evaluate(
        (key) => window.localStorage.getItem(key),
        STORAGE_KEYS.token,
      );
      expect(token).toBeNull();
    });
  });
});
