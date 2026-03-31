

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as productDb from "@/modules/products/product.db";

import { addVariantToProduct } from "@/modules/products/product.service";

vi.mock("@/modules/products/product.db");

describe("Variant Creation (Mocked)", () => {
  const storeId = "store-1";
  const productId = "product-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

it("should create a variant for a product", async () => {
  const mockProduct = {
    id: productId,
    storeId,
    deletedAt: null,
  };

  const dbVariant = {
    id: "variant-1",
    productId,
    name: "Small",
    price: "199", //  DB returns string
    inventory: 10,
  };

  //  Arrange
  vi.mocked(productDb.findProductForVariantInsert).mockResolvedValue(
    mockProduct as any
  );

  vi.mocked(productDb.insertVariant).mockResolvedValue(
    dbVariant as any
  );

  // Act
  const result = await addVariantToProduct({
    productId,
    storeId,
    name: "Small",
    price: 199,
    inventory: 10,
  });

  // Assert (service transforms price)
  expect(result).toEqual({
    ...dbVariant,
    price: "199.00", // formatted output
  });

  expect(productDb.findProductForVariantInsert).toHaveBeenCalledWith({
    productId,
    storeId,
  });

  expect(productDb.insertVariant).toHaveBeenCalledWith({
    productId,
    name: "Small",
    price: "199", // string sent to DB
    inventory: 10,
  });
});

it("should throw if product does not belong to store", async () => {
  // Arrange → simulate ownership failure
  vi.mocked(productDb.findProductForVariantInsert).mockResolvedValue(undefined);

  // Act + Assert
  await expect(
    addVariantToProduct({
      productId,
      storeId: "f19f8cd6-a5d4-4769-bf71-88521ec52f93", // wrong store
      name: "Small",
      price: 199,
      inventory: 10,
    })
  ).rejects.toMatchObject({
    message: "Product not found or not owned",
    statusCode: 404,
  });

  //  ensure insert never happens
  expect(productDb.insertVariant).not.toHaveBeenCalled();
});
});