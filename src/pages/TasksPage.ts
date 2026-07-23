import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LOAD_TIMEOUT } from '../data/test-data';

/** Page object for the Kanban task board (`/tasks`) and the Create Task modal. */
export class TasksPage extends BasePage {
  constructor(page: Page) {
    super(page, '/tasks');
  }

  private get board(): Locator {
    return this.byTestId('kanban-board');
  }

  /** The four Kanban columns (To Do, In Progress, Review, Done). */
  get columns(): Locator {
    return this.page.locator('[data-testid^="column-"]');
  }

  /** Per-column count badges. */
  get countBadges(): Locator {
    return this.page.locator('[data-testid^="count-"]');
  }

  private get addTaskButton(): Locator {
    return this.byTestId('add-task-btn');
  }

  /** The Create Task modal dialog. */
  get dialog(): Locator {
    return this.page.getByRole('dialog');
  }

  private get form(): Locator {
    return this.byTestId('task-form');
  }

  async waitForBoard(): Promise<void> {
    await expect(this.board).toBeVisible({ timeout: LOAD_TIMEOUT });
    await expect(this.columns).toHaveCount(4, { timeout: LOAD_TIMEOUT });
  }

  /**
   * Open the Create Task modal (button lives in the header) and wait for the
   * scale-in animation to settle before interaction.
   */
  async clickAddTask(): Promise<void> {
    await this.addTaskButton.click();
    await expect(this.form).toBeVisible({ timeout: LOAD_TIMEOUT });
    // Wait out the modal scale-in animation.
    await this.page.waitForTimeout(400);
  }

  /** Assert every expected field of the Create Task form is present. */
  async expectFormFields(): Promise<void> {
    const fields = [
      'task-title',
      'task-description',
      'task-assignee',
      'task-priority',
      'task-status',
      'task-due-date',
      'task-tags',
    ];
    for (const id of fields) {
      await expect(this.byTestId(id)).toBeVisible();
    }
  }
}
