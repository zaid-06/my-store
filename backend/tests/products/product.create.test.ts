import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/config/db";

import { products ,productVariants, productMedia, } from "../../src/modules/products/product.schema";
import { stores } from "../../src/modules/stores/store.schema";
import { createProduct } from "../../src/modules/products/product.service";

describe("Product Creation", () => {
  let storeId: string;

  beforeEach(async () => {
    // Clean DB (important for isolation)
    await db.delete(productVariants);
  await db.delete(productMedia);
  await db.delete(products);
  await db.delete(stores);

    // Create a store
    const [store] = await db
      .insert(stores)
      .values({
        name: "Test Store",
        username: "teststore",
        userId: "user-123",
        isPublic: true,
      })
      .returning();

    storeId = store.id;
  });

  // console.log("Store ID for tests:......................:", storeId);

  it("should create a product with draft status", async () => {
    const product = await createProduct({
      storeId: storeId,
      title: "Test Product",
      description: "Test description",
      isFeatured: false,
    });

    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.title).toBe("Test Product");
    expect(product.status).toBe("draft");
    
    expect(product.storeId).toBe(storeId);
  });

  it("should create product even without description", async () => {
    const product = await createProduct({
      storeId: storeId,
      title: "No Description Product",
    });

    expect(product.description).toBeNull();
  });

  it("should default isFeatured to false", async () => {
    const product = await createProduct({
      storeId: storeId,
      title: "Featured Check",
    });

    expect(product.isFeatured).toBe(false);
  });
});


