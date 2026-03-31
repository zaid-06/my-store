

import { ApiError } from "@/shared/api-error";
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  publishProduct,
  getSinglePublishedProductByStoreAndId,
} from "@/modules/products/product.service";

import * as productDb from "@/modules/products/product.db";
import *  as storeDb from "@/modules/stores/store.db"

vi.mock("@/modules/products/product.db");
vi.mock("@/modules/stores/store.db");

describe("Product Publishing Validation (MOCKED)", () => {
  const storeId = "store-1";
  const productId = "product-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });


it("should throw if no variants exist", async () => {
  // Arrange
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue({
    id: productId,
    storeId,
    status: "published",
  } as any);

  vi.mocked(productDb.dbGetVariantsByProductId).mockResolvedValue([]);
  vi.mocked(productDb.dbGetMediaByProductId).mockResolvedValue([
    { id: "m1" },
  ] as any);

  // Act + Assert
  await expect(
    getSinglePublishedProductByStoreAndId({
      productId,
      storeId,
    })
  ).rejects.toThrow(ApiError);

  await expect(
    getSinglePublishedProductByStoreAndId({
      productId,
      storeId,
    })
  ).rejects.toThrow("Product not found");

  //  verify flow
  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    productId,
    storeId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});

  //  no media

it("should throw if no media exist", async () => {
  // Arrange
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue({
    id: productId,
    storeId,
    status: "published",
  } as any);

  //  has variants
  vi.mocked(productDb.dbGetVariantsByProductId).mockResolvedValue([
    { id: "v1" },
  ] as any);

  //  no media
  vi.mocked(productDb.dbGetMediaByProductId).mockResolvedValue([]);

  // Act + Assert
  await expect(
    getSinglePublishedProductByStoreAndId({
      productId,
      storeId,
    })
  ).rejects.toThrow(ApiError);

  await expect(
    getSinglePublishedProductByStoreAndId({
      productId,
      storeId,
    })
  ).rejects.toThrow("Product not found");

  //  verify calls
  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    productId,
    storeId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});

  it("should publish when valid", async () => {
  // Arrange
  const mockStore = {
    id: storeId,
    isSuspended: false,
  };

  const mockProduct = {
    id: productId,
    storeId,
    status: "draft",
  };

  vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

  vi.mocked(productDb.findProductForPublish).mockResolvedValue(
    mockProduct as any
  );

  vi.mocked(productDb.countProductVariants).mockResolvedValue(1);
  vi.mocked(productDb.countProductMedia).mockResolvedValue(1);

  vi.mocked(productDb.updateProductStatus).mockResolvedValue({
    id: productId,
    status: "published",
  } as any);

  // Act
  const result = await publishProduct({ productId, storeId });

  // Assert (result)
  expect(result).toEqual({
    id: productId,
    status: "published",
  });

  //  verify full flow
  expect(storeDb.dbGetStoreById).toHaveBeenCalledWith(storeId);

  expect(productDb.findProductForPublish).toHaveBeenCalledWith({
    productId,
    storeId,
  });

  expect(productDb.countProductVariants).toHaveBeenCalledWith(productId);
  expect(productDb.countProductMedia).toHaveBeenCalledWith(productId);

  expect(productDb.updateProductStatus).toHaveBeenCalledWith({
    productId,
    status: "published",
  });
});


it("should throw if no variants or media exist", async () => {
  // Arrange
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue({
    id: productId,
    storeId,
    status: "published",
  } as any);

  vi.mocked(productDb.dbGetVariantsByProductId).mockResolvedValue([]);
  vi.mocked(productDb.dbGetMediaByProductId).mockResolvedValue([]);

  // Act
  const promise = getSinglePublishedProductByStoreAndId({
    productId,
    storeId,
  });

  // Assert
  await expect(promise).rejects.toMatchObject({
    message: "Product not found",
    statusCode: 404,
  });

  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    productId,
    storeId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});
});