import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html'], ['list']],

  projects: [
    {
      name: 'api',
      use: {
        baseURL: 'https://fakestoreapi.com',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
  ],
});
