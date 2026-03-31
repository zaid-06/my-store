
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as productDb from "@/modules/products/product.db";
import * as orderDb from "@/modules/orders/order.db";

import { getSinglePublishedProductByStoreAndId, softDeleteProduct } from "@/modules/products/product.service";

vi.mock("@/modules/products/product.db");
vi.mock("@/modules/orders/order.db");

describe("Soft Delete Behavior (Mocked)", () => {
  const storeId = "store-1";
  const productId = "product-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  Should soft delete product
  it("should soft delete product", async () => {
    const mockProduct = {
      id: productId,
      storeId,
      deletedAt: null,
    };

    const deletedProduct = {
      ...mockProduct,
      deletedAt: new Date(),
    };

    // Arrange
    vi.mocked(productDb.findProductByIdAndStoreId).mockResolvedValue(
      mockProduct as any
    );

    vi.mocked(orderDb.findActiveOrdersByProductId).mockResolvedValue([]);

    vi.mocked(productDb.softDeleteProductDB).mockResolvedValue(
      deletedProduct as any
    );

    // Act
    const result = await softDeleteProduct({
      productId,
      storeId,
    });

    // Assert
    expect(result).toEqual(deletedProduct);

    expect(productDb.findProductByIdAndStoreId).toHaveBeenCalledWith({
      productId,
      storeId,
    });

    expect(orderDb.findActiveOrdersByProductId).toHaveBeenCalledWith(
      productId
    );

    expect(productDb.softDeleteProductDB).toHaveBeenCalledWith({
      productId,
      storeId,
    });
  });

  it("should NOT delete already deleted product", async () => {
  const mockProduct = {
    id: productId,
    storeId,
    deletedAt: new Date(), // already deleted 
  };

  // Arrange
  vi.mocked(productDb.findProductByIdAndStoreId).mockResolvedValue(
    mockProduct as any
  );

  // Act + Assert
  await expect(
    softDeleteProduct({
      productId,
      storeId,
    })
  ).rejects.toThrow("Product already deleted");

  // ensure no further operations happen
  expect(orderDb.findActiveOrdersByProductId).not.toHaveBeenCalled();
  expect(productDb.softDeleteProductDB).not.toHaveBeenCalled();
});

it("should NOT delete product of another store", async () => {
  // Arrange → product not found for this store
  vi.mocked(productDb.findProductByIdAndStoreId).mockResolvedValue(null as any);

  // Act + Assert
  await expect(
    softDeleteProduct({
      productId,
      storeId, // wrong store
    })
  ).rejects.toThrow("Product not found");

  //  ensure nothing else runs
  expect(orderDb.findActiveOrdersByProductId).not.toHaveBeenCalled();
  expect(productDb.softDeleteProductDB).not.toHaveBeenCalled();
});

it("should NOT return deleted product in public API", async () => {
  // Arrange → DB will NOT return deleted product
  vi.mocked(productDb.dbGetSinglePublishedProduct).mockResolvedValue(undefined);

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

  //  ensure no further calls
  expect(productDb.dbGetVariantsByProductId).not.toHaveBeenCalled();
  expect(productDb.dbGetMediaByProductId).not.toHaveBeenCalled();
});

});