import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { EMPLOYEE_PAGE_LIMIT } from '../../src/data/test-data';

test.describe('Employees', () => {
  test('EMP-01: Hiển thị danh sách nhân viên mặc định @smoke', async ({ page, employeesPage }) => {
    await annotate({ module: 'EMP', severity: 'critical', tags: ['smoke'] });

    await test.step('Vào trang Employees', async () => {
      await employeesPage.goto();
      await expect(page).toHaveURL(/\/employees/);
      // Real page title is "Employee Directory" (singular) — match /directory/i.
      await expect(employeesPage.pageTitle).toHaveText(/directory/i);
    });

    await test.step('Đợi bảng load', async () => {
      await employeesPage.waitForTable();
    });

    await test.step(`Assert có >= ${EMPLOYEE_PAGE_LIMIT} dòng`, async () => {
      await expect(employeesPage.rows.nth(EMPLOYEE_PAGE_LIMIT - 1)).toBeVisible();
      expect(await employeesPage.rows.count()).toBeGreaterThanOrEqual(EMPLOYEE_PAGE_LIMIT);
    });
  });

  test('EMP-02: Tìm kiếm theo tên', async ({ employeesPage }) => {
    await annotate({ module: 'EMP', severity: 'normal', tags: ['regression'] });

    await test.step('Vào trang Employees', async () => {
      await employeesPage.goto();
      await employeesPage.waitForTable();
    });

    await test.step('Gõ "John" vào ô search', async () => {
      await employeesPage.search('John');
    });

    await test.step('Assert kết quả đã được lọc', async () => {
      const count = await employeesPage.rows.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(EMPLOYEE_PAGE_LIMIT);
    });

    await test.step('Assert mọi dòng khớp "John"', async () => {
      const count = await employeesPage.rows.count();
      for (let i = 0; i < count; i++) {
        // "John" also matches "Johnson" (e.g. Sarah Johnson) — case-insensitive.
        await expect(employeesPage.rows.nth(i)).toContainText(/john/i);
      }
    });
  });

  test('EMP-05: Xem profile nhân viên', async ({ page, employeesPage }) => {
    await annotate({ module: 'EMP', severity: 'normal', tags: ['regression'] });

    await test.step('Vào trang Employees', async () => {
      await employeesPage.goto();
      await employeesPage.waitForTable();
    });

    await test.step('Click vào dòng đầu tiên', async () => {
      await employeesPage.clickFirstRow();
    });

    await test.step('Assert URL chứa /employees/u', async () => {
      await expect(page).toHaveURL(/\/employees\/u\d+/);
    });

    await test.step('Assert profile chi tiết hiển thị', async () => {
      await employeesPage.waitForProfile();
    });
  });
});
