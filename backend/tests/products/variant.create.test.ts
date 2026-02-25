// import { describe, it, expect, beforeEach } from "vitest";
// import { db } from "@/config/db"; // or relative path

// describe("Feature Name", () => {

//   beforeEach(async () => {
//     // optional setup
//   });

//   it("should do something", async () => {
//     // test logic
//   });

// });





import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/config/db";
// import { stores } from "../../src/db/schema";
import { stores } from "@/modules/stores/store.schema";
import { products, productVariants , productMedia} from "@/modules/products/product.schema";

import { addVariantToProduct } from "@/modules/products/product.service";

describe("Variant Creation", () => {
  let storeId: string;
  let productId: string;

  beforeEach(async () => {
    // 🔴 FK-safe cleanup order
    await db.delete(productVariants);
  await db.delete(productMedia);
  await db.delete(products);
  await db.delete(stores);
   
    

    const [store] = await db
      .insert(stores)
      .values({
        name: "Test Store",
        userId: "user-1",
        username: "testuser",
      })
      .returning();

    storeId = store.id;
    const [product] = await db
      .insert(products)
      .values({
        storeId: storeId,
        title: "Test Product",
        status: "draft",
        deletedAt: null, // ✅ REQUIRED
      })
      .returning();

    productId = product.id;
  });

  it("should create a variant for a product", async () => {
    const variant = await addVariantToProduct({
      productId: productId,
      storeId: storeId,
      name: "Small",
      price: 199,
      inventory: 10,
    });

    expect(variant).not.toBeNull();
    expect(variant?.name).toBe("Small");
    // expect(variant?.price).toBe('199.00')
    expect(variant?.inventory).toBe(10);
  });

  it("should return null if product does not belong to store", async () => {
    const variant = await addVariantToProduct({
      productId:productId,
      storeId: "f19f8cd6-a5d4-4769-bf71-88521ec52f93",
      name: "Small",
      price: 199,
      inventory: 10,
    });

    expect(variant).toBeNull();
  });
});


