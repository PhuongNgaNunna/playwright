import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LOAD_TIMEOUT } from '../data/test-data';

/** Page object for the role-aware dashboard (`/`). */
export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page, '/');
  }

  /** Container holding the stat cards. */
  private get statCardsContainer(): Locator {
    return this.byTestId('stat-cards');
  }

  /** All stat cards inside the container. */
  get statCards(): Locator {
    return this.statCardsContainer.locator('.stat-card');
  }

  /** Admin-only sidebar entry — hidden for manager/employee. */
  get navAuditLogs(): Locator {
    return this.byTestId('nav-audit-logs');
  }

  /** Wait until the dashboard has rendered its title. */
  async waitForReady(): Promise<void> {
    await expect(this.pageTitle).toHaveText('Dashboard', { timeout: LOAD_TIMEOUT });
    await expect(this.statCardsContainer).toBeVisible({ timeout: LOAD_TIMEOUT });
  }
}
