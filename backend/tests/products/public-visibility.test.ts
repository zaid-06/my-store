import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/config/db";

import {
  products,
  productVariants,
  productMedia,

} from "@/modules/products/product.schema";






import { stores } from "@/modules/stores/store.schema";


// import { 
//   getSinglePublishedProductByStoreAndId,

// } from "@/modules/product/product.service";
import { getSinglePublishedProductByStoreAndId } from "@/modules/products/product.service";

let storeId: string;

describe("Public Visibility Filtering", () => {
  beforeEach(async () => {
    // Clean tables (order matters because of FK)
    await db.delete(productMedia);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(stores);

    // Create fresh store
    const [store] = await db
      .insert(stores)
      .values({
        name: "Test Store",
        userId: "user-1",
        username: "testuser",
      })
      .returning();

    storeId = store.id;
  });

  // ❌ Should NOT return draft product
  it("should NOT return draft product", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "Draft Product",
        status: "draft",
        deletedAt: null,
      })
      .returning();

    const result = await getSinglePublishedProductByStoreAndId({
      storeId,
      productId: product.id,
    });

    expect(result).toBeNull();
  });

  // ❌ Should NOT return published product without variants
  it("should NOT return published product without variants", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "No Variant Product",
        status: "published",
        deletedAt: null,
      })
      .returning();

    const result = await getSinglePublishedProductByStoreAndId({
      storeId,
      productId: product.id,
    });

    expect(result).toBeNull();
  });

  // ❌ Should NOT return published product without media
  it("should NOT return published product without media", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "No Media Product",
        status: "published",
        deletedAt: null,
      })
      .returning();

    // Add variant only
    await db.insert(productVariants).values({
      productId: product.id,
      name: "Small",
      price: "199",
      inventory: 10,
    });

    const result = await getSinglePublishedProductByStoreAndId({
      storeId,
      productId: product.id,
    });

    expect(result).toBeNull();
  });

  // ✅ Should return product when published + has variants + has media
  it("should return product when published and has variants & media", async () => {
    const [product] = await db
      .insert(products)
      .values({
        storeId,
        title: "Visible Product",
        status: "published",
        deletedAt: null,
      })
      .returning();

    // Add variant
    await db.insert(productVariants).values({
      productId: product.id,
      name: "Small",
      price: "199",
      inventory: 10,
    });

    // Add media
    await db.insert(productMedia).values({
      productId: product.id,
      url: "https://example.com/image.jpg",
      type: "image",
    });

    const result = await getSinglePublishedProductByStoreAndId({
      storeId,
      productId: product.id,
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Visible Product");
    expect(result?.variants.length).toBe(1);
    expect(result?.media.length).toBe(1);
  });
});