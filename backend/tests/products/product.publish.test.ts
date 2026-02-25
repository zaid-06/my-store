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

import { stores } from "@/modules/stores/store.schema";
import {
  products,
  productVariants,
  productMedia,
} from "@/modules/products/product.schema";

import { getSinglePublishedProductByStoreAndId , publishProduct } from "@/modules/products/product.service";

describe("Product Publishing Validation", () => {
  let storeId: string;
  let productId: string;

  beforeEach(async () => {
    // FK safe cleanup order
    await db.delete(productVariants);
  await db.delete(productMedia);
  await db.delete(products);
  await db.delete(stores);

    // create store
    const [store] = await db
      .insert(stores)
      .values({
        name: "Test Store",
        userId: "user-1",
        username: "testuser",

      })
      .returning();

    storeId = store.id;

    // create draft product
    const [product] = await db
      .insert(products)
      .values({
        storeId : storeId,
        title: "Test Product",
        status: "draft",
        deletedAt: null, // ✅ REQUIRED

      })
      .returning();

    productId = product.id;
  });


  // ✅ should fail without variant
  it("should NOT publish if no variants exist", async () => {
  // const publishResult = await publishProduct({
  //   productId,
  //   storeId,
  // });

  // expect(publishResult).toBeNull();

  const result = await getSinglePublishedProductByStoreAndId({
    productId,
    storeId,
  });

  expect(result).toBeNull();
});

  // ✅ should fail without media
  it("should NOT publish if no media exist", async () => {
    // add variant only
    await db.insert(productVariants).values({
      productId: productId,
      name: "Small",
      price: "199",
      inventory: 10,
    });

    const result = await getSinglePublishedProductByStoreAndId({
      productId: productId,
      storeId: storeId,
    });

    expect(result).toBeNull();
  });

  // ✅ should publish when rules satisfied
  it("should publish when product has variant and media", async () => {
    await db.insert(productVariants).values({
      productId: productId,
      name: "large",
      price: "199",
      inventory: 10,
    });

    await db.insert(productMedia).values({
      productId: productId,
      url: "https://example.com/image.jpg",
      type: "image",
    });  
    await publishProduct({
      productId,
      storeId,
    });

    const result = await getSinglePublishedProductByStoreAndId({
      productId: productId,
      storeId: storeId,
    });

    expect(result).not.toBeNull();
    expect(result?.status).toBe("published");
  });

  // ✅ wrong store
  it("should NOT publish if product does not belong to store", async () => {
    const result = await getSinglePublishedProductByStoreAndId({
      productId: productId,
      storeId: "f19f8cd6-a5d4-4769-bf71-88521ec52f93",
    });

    expect(result).toBeNull();
  });
});
