import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { BasePage } from './BasePage';
import { API, LOAD_TIMEOUT, STORAGE_KEYS } from '../data/test-data';

/** Page object for the WorkNest login screen (`/login`). */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page, '/login');
  }

  get form(): Locator {
    return this.byTestId('login-form');
  }

  private get emailInput(): Locator {
    return this.byTestId('login-email');
  }

  private get passwordInput(): Locator {
    return this.byTestId('login-password');
  }

  private get submitButton(): Locator {
    return this.byTestId('login-submit');
  }

  get error(): Locator {
    return this.byTestId('login-error');
  }

  /**
   * Open the login page with the form guaranteed visible.
   *
   * Role projects load a storageState (already authenticated) and WorkNest keeps
   * the JWT in localStorage, so a bare visit to /login can auto-redirect to the
   * dashboard. We clear the stored session and reload so login/logout tests are
   * deterministic under any project.
   */
  override async goto(): Promise<void> {
    await this.page.goto(this.path);
    const authed = await this.page.evaluate(
      (key) => Boolean(window.localStorage.getItem(key)),
      STORAGE_KEYS.token,
    );
    if (authed) {
      await this.page.evaluate((keys) => {
        window.localStorage.removeItem(keys.token);
        window.localStorage.removeItem(keys.user);
      }, STORAGE_KEYS);
      await this.page.goto(this.path);
    }
    await expect(this.form).toBeVisible({ timeout: LOAD_TIMEOUT });
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Submit and resolve with the `/api/auth/login` response (for status assertions). */
  async submitAndCaptureLogin(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes(API.login)),
      this.submitButton.click(),
    ]);
    return response;
  }

  /** Full happy-path login used by data-driven and setup flows. */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /** Assert the inline error alert is visible and contains `text`. */
  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toContainText(text);
  }
}
