import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';
import { admin } from '../../src/data/users';
import type { ApiEnvelope, LoginPayload, WorkNestUser } from '../../src/types';

test.describe('API', () => {
  test('API-01: POST /api/auth/login (admin) trả về 200 và JWT @smoke', async ({ apiClient }) => {
    await annotate({ module: 'API', severity: 'critical', tags: ['smoke'] });

    const response = await test.step('Gửi POST /api/auth/login', async () => {
      // apiClient is backed by a fresh request.newContext() (see base-fixtures).
      return apiClient.login(admin.email, admin.password);
    });

    await test.step('Assert status = 200', async () => {
      expect(response.status()).toBe(200);
    });

    const body: ApiEnvelope<LoginPayload> = await response.json();

    await test.step('Assert có token', async () => {
      expect(body.success).toBe(true);
      expect(body.data.token).toBeTruthy();
    });

    await test.step('Assert user.role = admin', async () => {
      expect(body.data.user.role).toBe('admin');
    });
  });

  test('API-02: GET /api/auth/me không token trả về 401', async ({ apiClient }) => {
    await annotate({ module: 'API', severity: 'critical', tags: ['regression'] });

    const response = await test.step('Gửi GET /api/auth/me không header', async () => {
      return apiClient.me();
    });

    await test.step('Assert status = 401', async () => {
      expect(response.status()).toBe(401);
    });

    await test.step('Assert body có message lỗi', async () => {
      const body: ApiEnvelope<null> = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/unauthorized|token|auth/i);
    });
  });

  test('API-04: GET /api/employees trả về danh sách nhân viên', async ({ apiClient }) => {
    await annotate({ module: 'API', severity: 'normal', tags: ['regression'] });

    const token = await test.step('Login admin lấy token', async () => {
      return apiClient.loginAdmin();
    });

    const response = await test.step('Gửi GET /api/employees?page=1&limit=8', async () => {
      return apiClient.employees(token, 1, 8);
    });

    await test.step('Assert status = 200', async () => {
      expect(response.status()).toBe(200);
    });

    const body: ApiEnvelope<WorkNestUser[]> = await response.json();

    await test.step('Assert data là mảng', async () => {
      expect(Array.isArray(body.data)).toBeTruthy();
    });

    await test.step('Assert length >= 8', async () => {
      expect(body.data.length).toBeGreaterThanOrEqual(8);
    });
  });
});
