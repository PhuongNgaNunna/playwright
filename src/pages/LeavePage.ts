import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LOAD_TIMEOUT } from '../data/test-data';
import type { LeaveFormData } from '../types';

/** Page object for Leave Management (`/leave`) including the New Request modal. */
export class LeavePage extends BasePage {
  constructor(page: Page) {
    super(page, '/leave');
  }

  private get balance(): Locator {
    return this.byTestId('leave-balance');
  }

  /** The four balance cards (Annual, Sick, Personal, Remote). */
  get balanceCards(): Locator {
    return this.balance.locator('> *');
  }

  private get newRequestButton(): Locator {
    return this.byTestId('new-leave-btn');
  }

  private get form(): Locator {
    return this.byTestId('leave-form');
  }

  private get typeSelect(): Locator {
    return this.byTestId('leave-type');
  }

  private get startInput(): Locator {
    return this.byTestId('leave-start');
  }

  private get endInput(): Locator {
    return this.byTestId('leave-end');
  }

  private get reasonInput(): Locator {
    return this.byTestId('leave-reason');
  }

  private get submitButton(): Locator {
    return this.byTestId('submit-leave');
  }

  async waitForBalance(): Promise<void> {
    await expect(this.balance).toBeVisible({ timeout: LOAD_TIMEOUT });
  }

  /**
   * Open the New Request modal and wait for it to settle.
   * The modal plays a ~200-300ms `animate-scaleIn`; clicking submit before it
   * finishes can be rejected as "intercepts pointer events", so we let it settle.
   */
  async openNewRequestModal(): Promise<void> {
    await this.newRequestButton.click();
    await expect(this.form).toBeVisible({ timeout: LOAD_TIMEOUT });
    // Wait out the scale-in animation before interacting with modal controls.
    await this.page.waitForTimeout(400);
  }

  /** Fill every field of the leave request form. */
  async fillForm(data: LeaveFormData): Promise<void> {
    // leave-type is a native <select>; selectOption fires the change React needs.
    await this.typeSelect.selectOption(data.type);
    await this.startInput.fill(data.start);
    await this.endInput.fill(data.end);
    await this.reasonInput.fill(data.reason);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
