// import { beforeAll, afterAll, beforeEach } from "vitest";
// import { db } from "../src/config/db";

// beforeAll(async () => {
//   // optional: connect db / run migrations
// });

// beforeEach(async () => {
//   // clean tables for isolation
//   await db.execute(`TRUNCATE TABLE 
//     product_media,
//     product_variants,
//     product_categories,
//     categories,
//     products,
//     stores
//     RESTART IDENTITY CASCADE`);
// });

// afterAll(async () => {
//   // optional: close db connection
// });

// import { vi } from "vitest";

// vi.mock("../src/modules/auth/auth", () => ({
//   auth: {
//     api: {
//       getSession: async () => ({
//         user: { id: "test-user-id" },
//       }),
//     },
//   },
// }));

import { beforeAll, beforeEach, afterAll } from "vitest";
import { db } from "../src/config/db";
import {
  productVariants,
  productMedia,
  products,
} from "../src/modules/products/product.schema";
import { stores } from "../src/modules/stores/store.schema";

beforeAll(async () => {
  // Verify DB connection
  await db.execute(`SELECT 1`);
});

beforeEach(async () => {
  /**
   * IMPORTANT:
   * Order matters because of foreign keys
   */
  await db.delete(productVariants);
  await db.delete(productMedia);
  await db.delete(products);
  await db.delete(stores);
});

afterAll(async () => {
  // If you are using pg client directly:
  // await db.end();
});