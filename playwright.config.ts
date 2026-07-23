import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import categories from './reports/categories.json';

/**
 * WorkNest Playwright Test Suite — configuration.
 *
 * Six projects:
 *   1. setup                  — logs in each role once, saves storageState (serial).
 *   2. admin-chromium         — E2E + data-driven + a11y, reuses admin session.
 *   3. manager-chromium       — the 12 core E2E specs, reuses manager session.
 *   4. employee-chromium      — the 12 core E2E specs, reuses employee session.
 *   5. api-project            — API tests via request context (no browser UI).
 *   6. visual-admin-chromium  — Visual regression at a fixed 1440x900 viewport.
 */

const BASE_URL = process.env.BASE_URL ?? 'https://worknest-site.netlify.app';
const AUTH_DIR = path.join(__dirname, '.auth');
const storage = (role: string) => path.join(AUTH_DIR, `${role}.json`);

/** The 12 core E2E specs that must run under every role (12 x 3 = 36 runs). */
const CORE_E2E: RegExp[] = [
  /e2e[\\/]auth\.spec\.ts/,
  /e2e[\\/]dashboard\.spec\.ts/,
  /e2e[\\/]employees\.spec\.ts/,
  /e2e[\\/]leave\.spec\.ts/,
  /e2e[\\/]tasks\.spec\.ts/,
];

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        detail: true,
        suiteTitle: false,
        categories,
        environmentInfo: {
          BASE_URL,
          NODE_VERSION: process.version,
          OS: `${process.platform} ${process.arch}`,
        },
      },
    ],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /setup[\\/]auth\.setup\.ts/,
      fullyParallel: false,
    },
    {
      name: 'admin-chromium',
      dependencies: ['setup'],
      // admin runs the core E2E + the data-driven login test + the a11y bonus test.
      testMatch: [/e2e[\\/].*\.spec\.ts/, /a11y[\\/].*\.spec\.ts/],
      use: { ...devices['Desktop Chrome'], storageState: storage('admin') },
    },
    {
      name: 'manager-chromium',
      dependencies: ['setup'],
      testMatch: CORE_E2E,
      use: { ...devices['Desktop Chrome'], storageState: storage('manager') },
    },
    {
      name: 'employee-chromium',
      dependencies: ['setup'],
      testMatch: CORE_E2E,
      use: { ...devices['Desktop Chrome'], storageState: storage('employee') },
    },
    {
      name: 'api-project',
      testMatch: /api[\\/].*\.spec\.ts/,
      use: { baseURL: BASE_URL },
    },
    {
      name: 'visual-admin-chromium',
      dependencies: ['setup'],
      testMatch: /visual[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: storage('admin'),
      },
    },
  ],
});
