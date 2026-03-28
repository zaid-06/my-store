import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/config/db";

import { products } from "@/modules/products/product.schema";
import { stores } from "@/modules/stores/store.schema";

import {
  softDeleteProduct,
  getSinglePublishedProductByStoreAndId,
} from "@/modules/products/product.service";

let storeId: string;
let otherStoreId: string;

describe("Soft Delete Behavior", () => {
  beforeEach(async () => {
    // Clean tables
    await db.delete(products);
    await db.delete(stores);

    // Create Store 1
    const [store1] = await db
      .insert(stores)
      .values({
        name: "Store 1",
        userId: "user-1",
        username: "testuser1",
      })
      .returning();

    // Create Store 2
    const [store2] = await db
      .insert(stores)
      .values({
        name: "Store 2",
        userId: "user-2",
        username: "testuser2",
      })
      .returning();

    storeId = store1.id;
    otherStoreId = store2.id;
  });

  // ✅ Should soft delete product
  it("should soft delete product", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "Delete Me",
        status: "draft",
        deletedAt: null,
      })
      .returning();

    const result = await softDeleteProduct({
      productId: product.id,
      storeId,
    });

    expect(result).not.toBeNull();
    expect(result?.deletedAt).not.toBeNull();
  });

  // ❌ Should not delete product of another store
  // it("should NOT delete product of another store", async () => {
  //   const [product] = await db
  //     .insert(products)
  //     .values({
  //       storeId: otherStoreId,
  //       title: "Other Store Product",
  //       status: "draft",
  //       deletedAt: null,
  //     })
  //     .returning();

  //   const result = await softDeleteProduct({
  //     productId: product.id,
  //     storeId, // wrong store
  //   });

  //   expect(result).toBeNull();
  // });

  it("should NOT delete product of another store", async () => {
  const [product] = await db
    .insert(products)
    .values({
      storeId: otherStoreId,
      title: "Other Store Product",
      status: "draft",
      deletedAt: null,
    })
    .returning();

  await expect(
    softDeleteProduct({
      productId: product.id,
      storeId, // wrong store
    })
  ).rejects.toThrow("Product not found");
});

 // ❌ Should not delete already deleted product
it("should NOT delete already deleted product", async () => {
  const [product] = await db
    .insert(products)
    .values({
      storeId,
      title: "Already Deleted",
      status: "draft",
      deletedAt: new Date(),
    })
    .returning();

  await expect(
    softDeleteProduct({
      productId: product.id,
      storeId,
    })
  ).rejects.toThrow("Product already deleted");
});
  // ❌ Deleted product should not be visible publicly
  it("should NOT return deleted product in public API", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "Published Product",
        status: "published",
        deletedAt: null,
      })
      .returning();

    // Soft delete it
    await softDeleteProduct({
      productId: product.id,
      storeId,
    });

    const result = await getSinglePublishedProductByStoreAndId({
      storeId,
      productId: product.id,
    });

    expect(result).toBeNull();
  });
});