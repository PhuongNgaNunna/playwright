import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LOAD_TIMEOUT } from '../data/test-data';

/** Page object for the employee directory (`/employees`) and profile pages. */
export class EmployeesPage extends BasePage {
  constructor(page: Page) {
    super(page, '/employees');
  }

  private get table(): Locator {
    return this.byTestId('employee-table');
  }

  /** All body rows of the employee table. */
  get rows(): Locator {
    return this.table.locator('tbody tr');
  }

  private get searchInput(): Locator {
    return this.byTestId('employee-search');
  }

  /** Profile detail container (appears after the profile page finishes loading). */
  get profileContainer(): Locator {
    return this.byTestId('employee-profile-page');
  }

  /** Wait for the directory table and its first row to render. */
  async waitForTable(): Promise<void> {
    await expect(this.table).toBeVisible({ timeout: LOAD_TIMEOUT });
    await expect(this.rows.first()).toBeVisible({ timeout: LOAD_TIMEOUT });
  }

  /**
   * Type into the search box and wait for the debounced, client-side filter to
   * change the visible rows. WorkNest filters ~300ms after typing and does NOT
   * reflect the term in the URL, so we wait on the row count changing from its
   * pre-search value — a web-first signal, no fixed timeout needed.
   */
  async search(term: string): Promise<void> {
    const initialCount = await this.rows.count();
    await this.searchInput.fill(term);
    await expect(this.rows).not.toHaveCount(initialCount);
  }

  /**
   * Open the first employee's profile. The row itself is not a link — the
   * navigable element is the inner `<a data-testid="profile-link-{id}">`.
   */
  async clickFirstRow(): Promise<void> {
    await this.rows.first().getByTestId(/^profile-link-/).click();
    await this.page.waitForURL(/\/employees\/u\d+/);
  }

  /** Wait for the profile detail card (loads asynchronously after navigation). */
  async waitForProfile(): Promise<void> {
    await expect(this.profileContainer).toBeVisible({ timeout: 15_000 });
  }
}
