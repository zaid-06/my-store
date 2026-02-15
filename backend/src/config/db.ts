import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

import * as userSchema from "../modules/users/user.schema";
import * as storeSchema from "../modules/stores/store.schema"; 

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...userSchema,
    ...storeSchema, // ✅ ADD THIS
  },
});
