import { defineConfig, devices } from '@playwright/test';

const JSONPLACEHOLDER_URL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
const BOOKER_URL = process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  // ---- Flaky-test controls ----
  // Retry only in CI. A test that fails then passes is reported as "flaky" (not hidden), with a trace attached.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  // Explicit timeouts: generous enough for slow public sites, tight enough to fail fast on real problems.
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry', // trace of the failed attempt, only recorded when a retry happens
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ---- UI projects (tests/ui) ----
    // Locally: installed Google Chrome. In CI: Playwright's bundled Chromium (faster, no Chrome install).
    {
      name: 'chrome',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
    },
    { name: 'chromium', testMatch: 'ui/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: 'ui/**/*.spec.ts', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: 'ui/**/*.spec.ts', use: { ...devices['Desktop Safari'] } },

    // ---- API projects (tests/api): no browser needed ----
    { name: 'api', testMatch: 'api/jsonplaceholder/**/*.spec.ts', use: { baseURL: JSONPLACEHOLDER_URL } },
    { name: 'api-booker', testMatch: 'api/restful-booker/**/*.spec.ts', use: { baseURL: BOOKER_URL } },
  ],
});
