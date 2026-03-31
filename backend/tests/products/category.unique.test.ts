
import { describe, it, expect, beforeEach, vi } from "vitest";

import * as storeDb from "@/modules/stores/store.db";
import * as productDb from "@/modules/products/product.db";

import { createCategory } from "@/modules/products/product.service";
import { ApiError } from "@/shared/api-error";

vi.mock("@/modules/stores/store.db");
vi.mock("@/modules/products/product.db");

describe("Category Uniqueness Per Store (Mocked)", () => {
  const storeId1 = "store-1";
  const storeId2 = "store-2";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Should create category
  it("should create category successfully", async () => {
    const mockStore = { id: storeId1 };

    const createdCategory = {
      id: "cat-1",
      storeId: storeId1,
      name: "Electronics",
    };

    // Arrange
    vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

    vi.mocked(productDb.findCategoryByStoreAndName).mockResolvedValue(undefined);

    vi.mocked(productDb.insertCategory).mockResolvedValue(
      createdCategory as any
    );

    // Act
    const category = await createCategory(storeId1, "Electronics");

    // Assert
    expect(category).toEqual(createdCategory);

    expect(productDb.insertCategory).toHaveBeenCalledWith({
      storeId: storeId1,
      name: "Electronics",
    });
  });

  //  duplicate in SAME store
  it("should throw error if duplicate category in same store", async () => {
    const mockStore = { id: storeId1 };

    // Arrange
    vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

    vi.mocked(productDb.findCategoryByStoreAndName).mockResolvedValue({
      id: "cat-1",
      storeId: storeId1,
      name: "Electronics",
    } as any);

    // Act + Assert
    await expect(
      createCategory(storeId1, "Electronics")
    ).rejects.toMatchObject({
      message: expect.stringContaining("already"),
    });

    //  ensure insert not called
    expect(productDb.insertCategory).not.toHaveBeenCalled();
  });

  // same category name in DIFFERENT store (allowed)
  it("should allow same category name in different stores", async () => {
    const mockStore = { id: storeId2 };

    const createdCategory = {
      id: "cat-2",
      storeId: storeId2,
      name: "Electronics",
    };

    // Arrange
    vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

    vi.mocked(productDb.findCategoryByStoreAndName).mockResolvedValue(undefined);

    vi.mocked(productDb.insertCategory).mockResolvedValue(
      createdCategory as any
    );

    // Act
    const category = await createCategory(storeId2, "Electronics");

    // Assert
    expect(category).toEqual(createdCategory);
  });
});


