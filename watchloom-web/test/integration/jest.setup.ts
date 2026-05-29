import { pool as appPool } from "@/db";

import { pool } from "./test-db";

afterAll(async () => {
  await pool.end();
  await appPool.end();
});
