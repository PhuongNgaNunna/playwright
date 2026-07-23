import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { users } from '../../src/data/users';

/**
 * DD-AUTH — data-driven login. The same login flow is driven by each row of
 * `src/data/users.json`, producing one test per role (admin/manager/employee).
 */
test.describe('Data-driven login (DD-AUTH)', () => {
  for (const user of users) {
    test(`DD-AUTH: Đăng nhập với role ${user.role}`, async ({ page, loginPage }) => {
      await annotate({ module: 'AUTH', severity: 'critical', tags: ['regression', 'data-driven'] });

      await test.step('Mở trang login', async () => {
        await loginPage.goto();
        await expect(loginPage.form).toBeVisible();
      });

      await test.step('Điền credentials', async () => {
        await loginPage.fillCredentials(user.email, user.password);
      });

      await test.step('Click submit', async () => {
        const response = await loginPage.submitAndCaptureLogin();
        expect(response.status()).toBe(200);
      });

      await test.step(`Assert điều hướng về ${user.expectedRoute}`, async () => {
        await expect(page).toHaveURL(/worknest-site\.netlify\.app\/?$/);
      });
    });
  }
});
