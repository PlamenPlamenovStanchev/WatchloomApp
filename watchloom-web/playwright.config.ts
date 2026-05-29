import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for Playwright E2E tests.");
}

if (
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL === testDatabaseUrl &&
  process.env.WATCHLOOM_ALLOW_TEST_DATABASE_AS_DATABASE_URL !== "true"
) {
  throw new Error("TEST_DATABASE_URL must be distinct from the production DATABASE_URL.");
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: process.env.JWT_SECRET || "watchloom-e2e-test-secret",
      WATCHLOOM_ALLOW_TEST_DATABASE_AS_DATABASE_URL: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
