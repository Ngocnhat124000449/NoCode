import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/contract',
  timeout: 10_000,
  retries: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'contract-results.json' }],
  ],
  use: {
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:3000',
  },
});
