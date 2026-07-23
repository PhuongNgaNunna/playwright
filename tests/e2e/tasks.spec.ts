import { test, expect } from '../../src/fixtures/base-fixtures';
import { annotate } from '../../src/utils/allure';

test.describe('Tasks (Kanban)', () => {
  test('TASK-01: Bảng Kanban hiển thị 4 cột', async ({ page, tasksPage }) => {
    await annotate({ module: 'TASK', severity: 'normal', tags: ['regression'] });

    await test.step('Vào trang Tasks', async () => {
      await tasksPage.goto();
      await expect(page).toHaveURL(/\/tasks/);
    });

    await test.step('Đợi board load', async () => {
      await tasksPage.waitForBoard();
    });

    await test.step('Assert 4 cột: To Do, In Progress, Review, Done', async () => {
      await expect(tasksPage.columns).toHaveCount(4);
      await expect(tasksPage.columns).toContainText([/To Do/i, /In Progress/i, /Review/i, /Done/i]);
    });

    await test.step('Assert mỗi cột có count badge', async () => {
      await expect(tasksPage.countBadges).toHaveCount(4);
    });
  });

  test('TASK-04: Mở modal Create New Task', async ({ tasksPage }) => {
    await annotate({ module: 'TASK', severity: 'critical', tags: ['regression'] });

    await test.step('Vào trang Tasks', async () => {
      await tasksPage.goto();
      await tasksPage.waitForBoard();
    });

    await test.step('Click nút "Add Task"', async () => {
      await tasksPage.clickAddTask();
    });

    await test.step('Assert modal dialog hiển thị', async () => {
      await expect(tasksPage.dialog).toBeVisible();
    });

    await test.step('Assert các trường form có mặt', async () => {
      await tasksPage.expectFormFields();
    });
  });
});
