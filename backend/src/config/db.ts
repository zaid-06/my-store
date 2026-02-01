// import { drizzle } from "drizzle-orm/node-postgres";
// // import { drizzle } from "drizzle-orm";

// import { Pool } from "pg";
// import { env } from "./env";

// const pool = new Pool({
//   connectionString: env.DATABASE_URL,
// });

// export const db = drizzle(pool);

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";
import * as userSchema from "../modules/users/user.schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...userSchema,
  },
});
