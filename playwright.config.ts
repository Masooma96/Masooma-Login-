import { defineConfig, devices } from '@playwright/test';

const JSONPLACEHOLDER_URL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
const BOOKER_URL = process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
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
