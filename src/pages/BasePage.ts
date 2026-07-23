import { expect, type Locator, type Page } from '@playwright/test';
import { STORAGE_KEYS } from '../data/test-data';

/**
 * Abstract parent of every page object. Owns the {@link Page} handle and the
 * page's canonical path, and centralises navigation/wait/logout behaviour plus
 * the locators shared by all authenticated screens (sidebar, header, toasts).
 *
 * Child pages expose their own elements as private-backed getters so callers
 * interact through intention-revealing methods, never raw selectors.
 */
export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    /** Canonical route for this page, e.g. `/employees`. */
    protected readonly path: string,
  ) {}

  /** Navigate to this page's canonical route. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Resolve a WorkNest element by its `data-testid`. */
  protected byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  // ── Shared chrome (present on every authenticated page) ──────────────────
  get pageTitle(): Locator {
    return this.byTestId('page-title');
  }

  get sidebar(): Locator {
    return this.byTestId('sidebar');
  }

  private get logoutButton(): Locator {
    return this.byTestId('logout-btn');
  }

  get toastContainer(): Locator {
    return this.byTestId('toast-container');
  }

  /** Success toast shown after a POST succeeds (e.g. leave request submitted). */
  get toastSuccess(): Locator {
    return this.byTestId('toast-success');
  }

  /** Click a sidebar nav item by its testid suffix, e.g. `navTo('employees')`. */
  async navTo(item: string): Promise<void> {
    await this.byTestId(`nav-${item}`).click();
  }

  /** Click the header logout button. */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /** Read the persisted JWT straight from localStorage (used by logout assertions). */
  async getStoredToken(): Promise<string | null> {
    return this.page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEYS.token);
  }

  /** Assert the browser landed on this page's route. */
  async expectAtPath(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.escapedPath()}/?$`));
  }

  private escapedPath(): string {
    return this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
