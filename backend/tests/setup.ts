

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


beforeAll(async () => {
  // Verify DB connection
  await db.execute(`SELECT 1`);
});

beforeEach(async () => {
  /**
   * IMPORTANT:
   * Order matters because of foreign keys
   */
  await db.delete(downloadLogs);
  await db.delete(digitalDownloads);
  await db.delete(orders);
  await db.delete(productVariants);

  await db.delete(productMedia);
  await db.delete(products);
  await db.delete(stores);
});

afterAll(async () => {
  // If you are using pg client directly:
  // await db.end();
});