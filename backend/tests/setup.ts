

import dotenv from "dotenv";
 
dotenv.config({ path: ".env.test" });


// optional: reset mocks, DB, etc.
import { beforeAll, beforeEach, afterAll } from "vitest";
import { db } from "../src/config/db";
import { downloadLogs, digitalDownloads } from "../src/modules/downloads/download.schema";
import {
  productVariants,
  productMedia,
  products,
} from "../src/modules/products/product.schema";

import { stores } from "../src/modules/stores/store.schema";
import { orders } from "../src/modules/orders/order.schema";
import { user } from "../src/modules/users/user.schema"; // agar BetterAuth users table hai
beforeAll(async () => {
  // Verify DB connection
  await db.execute(`SELECT 1`);
});

beforeEach(async () => {
  //  * IMPORTANT:
  //  * Order matters because of foreign keys
});

afterAll(async () => {
  // If you are using pg client directly:
  // await db.end();
});