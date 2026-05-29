import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for integration tests.");
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL !== testDatabaseUrl) {
  throw new Error("Integration tests must use TEST_DATABASE_URL as DATABASE_URL.");
}

const connectionString = testDatabaseUrl.includes("sslmode=require")
  ? testDatabaseUrl.replace("sslmode=require", "sslmode=require&uselibpqcompat=true")
  : testDatabaseUrl;

export const pool = new Pool({ connectionString });
export const testDb = drizzle(pool, { schema });
