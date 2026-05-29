import "dotenv/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for integration tests.");
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL === testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL must not be identical to DATABASE_URL.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET = process.env.JWT_SECRET || "watchloom-integration-test-secret";
