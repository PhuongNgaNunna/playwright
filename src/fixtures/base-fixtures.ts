import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeesPage } from '../pages/EmployeesPage';
import { LeavePage } from '../pages/LeavePage';
import { TasksPage } from '../pages/TasksPage';
import { WorkNestAPI } from '../api/WorkNestAPI';

/** Page objects and the API client injected into every test. */
interface WorkNestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeesPage: EmployeesPage;
  leavePage: LeavePage;
  tasksPage: TasksPage;
  apiClient: WorkNestAPI;
}

/**
 * Extended `test` that auto-instantiates each page object against the active
 * `page`, and provides a `WorkNestAPI` backed by an isolated request context.
 * Import this `test`/`expect` in every spec instead of `@playwright/test`.
 */
export const test = base.extend<WorkNestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  employeesPage: async ({ page }, use) => {
    await use(new EmployeesPage(page));
  },
  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },
  tasksPage: async ({ page }, use) => {
    await use(new TasksPage(page));
  },
  apiClient: async ({ playwright, baseURL }, use) => {
    const context = await playwright.request.newContext({ baseURL });
    await use(new WorkNestAPI(context));
    await context.dispose();
  },
});

export { expect };
