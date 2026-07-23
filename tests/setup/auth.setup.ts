import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../../src/pages/LoginPage';
import { users } from '../../src/data/users';
import { STORAGE_KEYS } from '../../src/data/test-data';

/**
 * Authentication setup — runs once (serial project) before the role E2E/visual
 * projects. For each role it performs a real UI login and persists the browser
 * session (localStorage JWT + cookies) to `.auth/<role>.json`. The role projects
 * then load that storageState, so 36+ tests require only 3 real logins.
 */

const AUTH_DIR = path.join(__dirname, '..', '..', '.auth');
fs.mkdirSync(AUTH_DIR, { recursive: true });

for (const user of users) {
  setup(`authenticate ${user.role}`, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await setup.step(`Login as ${user.role}`, async () => {
      await loginPage.login(user.email, user.password);
    });

    await setup.step('Assert dashboard reached', async () => {
      await expect(page).toHaveURL(/worknest-site\.netlify\.app\/?$/);
      await expect(page.getByTestId('page-title')).toHaveText('Dashboard');
    });

    await setup.step('Persist storageState', async () => {
      // Confirm the JWT is in localStorage before we snapshot the session.
      const token = await page.evaluate(
        (key) => window.localStorage.getItem(key),
        STORAGE_KEYS.token,
      );
      expect(token, `token missing for ${user.role}`).toBeTruthy();
      await page.context().storageState({ path: path.join(AUTH_DIR, `${user.role}.json`) });
    });
  });
}
