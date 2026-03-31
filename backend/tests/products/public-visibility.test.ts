
import * as productDb from "@/modules/products/product.db";

//  THIS IS REQUIRED
vi.mock("@/modules/products/product.db");
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSinglePublishedProductByStoreAndId } from "@/modules/products/product.service";

describe("Public Visibility Filtering (Mocked)", () => {
  const storeId = "store-1";
  const productId = "product-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Should NOT return draft product
 it("should throw if product is not published (filtered at DB level)", async () => {
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue(undefined);

  await expect(
    getSinglePublishedProductByStoreAndId({
      storeId,
      productId,
    })
  ).rejects.toMatchObject({
    message: "Product not found",
    statusCode: 404,
  });

  expect(productDb.dbGetVariantsByProductId).not.toHaveBeenCalled();
  expect(productDb.dbGetMediaByProductId).not.toHaveBeenCalled();
});
it("should throw if published product has no variants", async () => {
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
      storeId,
      productId,
    })
  ).rejects.toMatchObject({
    message: "Product not found",
    statusCode: 404,
  });

  // verify flow
  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    storeId,
    productId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});

it("should throw if published product has no media", async () => {
  // Arrange
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue({
    id: productId,
    storeId,
    status: "published",
  } as any);

  // has variant 
  vi.mocked(productDb.dbGetVariantsByProductId).mockResolvedValue([
    { id: "v1" },
  ] as any);

  // no media 
  vi.mocked(productDb.dbGetMediaByProductId).mockResolvedValue([]);

  // Act + Assert
  await expect(
    getSinglePublishedProductByStoreAndId({
      storeId,
      productId,
    })
  ).rejects.toMatchObject({
    message: "Product not found",
    statusCode: 404,
  });

  //  verify flow
  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    storeId,
    productId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});

it("should return product when published and has variants & media", async () => {
  // Arrange
  const mockProduct = {
    id: productId,
    storeId,
    title: "Visible Product",
    status: "published",
  };

  const mockVariants = [
    { id: "v1", name: "Small", price: "199", inventory: 10 },
  ];

  const mockMedia = [
    { id: "m1", url: "https://example.com/image.jpg", type: "image" },
  ];

  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue(
    mockProduct as any
  );

  vi.mocked(productDb.dbGetVariantsByProductId).mockResolvedValue(
    mockVariants as any
  );

  vi.mocked(productDb.dbGetMediaByProductId).mockResolvedValue(
    mockMedia as any
  );

  // Act
  const result = await getSinglePublishedProductByStoreAndId({
    storeId,
    productId,
  });

  // Assert
  expect(result).toEqual({
    ...mockProduct,
    variants: mockVariants,
    media: mockMedia,
  });

  //  extra strong checks
  expect(result.title).toBe("Visible Product");
  expect(result.variants).toHaveLength(1);
  expect(result.media).toHaveLength(1);

  //  verify calls
  expect(productDb.dbGetSinglePublishedProduct).toHaveBeenCalledWith({
    storeId,
    productId,
  });

  expect(productDb.dbGetVariantsByProductId).toHaveBeenCalledWith(productId);
  expect(productDb.dbGetMediaByProductId).toHaveBeenCalledWith(productId);
});
});