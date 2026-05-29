import "dotenv/config";

import { execSync } from "node:child_process";

async function globalSetup() {
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

  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || "watchloom-e2e-test-secret";
  process.env.WATCHLOOM_ALLOW_TEST_DATABASE_AS_DATABASE_URL = "true";

  execSync("npm run db:test:reset", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      TEST_DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: process.env.JWT_SECRET || "watchloom-e2e-test-secret",
      WATCHLOOM_ALLOW_TEST_DATABASE_AS_DATABASE_URL: "true",
    },
    shell: true,
    stdio: "inherit",
  });
}

export default globalSetup;
