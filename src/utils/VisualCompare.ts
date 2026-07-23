import type { Locator, Page } from '@playwright/test';
import { STORAGE_KEYS } from '../data/test-data';

/**
 * Shared options for {@link Page.toHaveScreenshot} across the visual suite.
 * `animations: 'disabled'` freezes CSS transitions and `maxDiffPixelRatio`
 * tolerates minor antialiasing differences so snapshots are not flaky.
 */
export const SCREENSHOT_OPTIONS = {
  fullPage: true,
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.1,
};

/**
 * Remove the persisted WorkNest session from localStorage and reload, so a page
 * that runs under a storageState project (already authenticated) renders its
 * logged-out state — needed for the login-page visual snapshot.
 */
export async function clearAuthAndReload(page: Page, url = '/login'): Promise<void> {
  await page.goto(url);
  await page.evaluate((keys) => {
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
  }, STORAGE_KEYS);
  await page.goto(url);
}

/**
 * Build the mask list for the admin dashboard snapshot. These regions carry
 * live/rolling data (stat counts, activity feed, meetings, avatar) that would
 * otherwise break pixel comparison on every run.
 */
export function dashboardMasks(page: Page): Locator[] {
  return [
    page.getByTestId('stat-cards'),
    page.getByTestId('recent-activity'),
    page.getByTestId('upcoming-meetings'),
    page.getByTestId('notification-btn'),
    page.getByTestId('header-search'),
  ];
}
