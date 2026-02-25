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
import { categories } from "@/modules/products/product.schema";

import { createCategory } from "@/modules/products/product.service";

import { ApiError } from "@/shared/api-error";

describe("Category Uniqueness Per Store", () => {
  let storeId1: string;
  let storeId2: string;

  beforeEach(async () => {
    await db.delete(categories);
    await db.delete(stores);

    const [store1] = await db.insert(stores).values({
      name: "Store 1",
      userId: "user-1",
       username: "testuser1",

    }).returning();


    const [store2] = await db.insert(stores).values({
      name: "Store 2",
      userId: "user-2",
       username: "testuser2",
      
    }).returning();

    storeId1 = store1.id;
    storeId2 = store2.id;
    // console.log("Created stores with IDs:. ........................", storeId1, storeId2);
  });

  // ✅ Should create category
  it("should create category successfully", async () => {
    const category = await createCategory(storeId1, "Electronics");

    expect(category).toBeDefined();
    expect(category.name).toBe("Electronics");
  });

  // ❌ Should throw error for duplicate in same store
  it("should throw error if duplicate category in same store", async () => {
    await createCategory(storeId1, "Electronics");

    await expect(
      createCategory(storeId1, "Electronics")
    ).rejects.toThrow(ApiError);
  });

  // ✅ Same name allowed in different store
  it("should allow same category name in different stores", async () => {
    await createCategory(storeId1, "Electronics");

    const category = await createCategory(storeId2, "Electronics");

    expect(category).toBeDefined();
    expect(category.storeId).toBe(storeId2);
  });
});



