

import { describe, it, expect, beforeEach, vi } from "vitest";

import * as storeDb from "@/modules/stores/store.db";
import * as productDb from "@/modules/products/product.db";
import * as storeUtils from "../../src/guards/store.guard"; // where assertStoreNotSuspended lives

import { createProduct } from "@/modules/products/product.service";

vi.mock("@/modules/stores/store.db");
vi.mock("@/modules/products/product.db");
vi.mock("../../src/guards/store.guard");

describe("Product Creation (Mocked)", () => {
  const storeId = "store-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a product with draft status", async () => {
    const mockStore = {
      id: storeId,
      isPublic: true,
      deletedAt: null,
      isSuspended: false,
    };

    const createdProduct = {
      id: "product-1",
      storeId,
      title: "Test Product",
      description: "Test description",
      isFeatured: false,
      status: "draft",
    };

    // Arrange
    vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(
      mockStore as any
    );

    vi.mocked(storeUtils.assertStoreNotSuspended).mockImplementation(
      () => {}
    );

    vi.mocked(productDb.insertProduct).mockResolvedValue(
      createdProduct as any
    );

    //  Act
    const product = await createProduct({
      storeId,
      title: "Test Product",
      description: "Test description",
      isFeatured: false,
      productType: "PHYSICAL", // required in your service
    });

    //  Assert
    expect(product).toEqual(createdProduct);

    expect(storeDb.dbGetStoreById).toHaveBeenCalledWith(storeId);

    expect(productDb.insertProduct).toHaveBeenCalledWith({
      storeId,
      title: "Test Product",
      description: "Test description",
      isFeatured: false,
      productType: "PHYSICAL",
    });
  });
  it("should create product even without description", async () => {
  const mockStore = {
    id: storeId,
    deletedAt: null,
    isSuspended: false,
  };

  const createdProduct = {
    id: "product-2",
    storeId,
    title: "No Description Product",
    description: null, //  important
    isFeatured: false,
    status: "draft",
  };

  //  Arrange
  vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(
    mockStore as any
  );

  vi.mocked(storeUtils.assertStoreNotSuspended).mockImplementation(
    () => {}
  );

  vi.mocked(productDb.insertProduct).mockResolvedValue(
    createdProduct as any
  );

  //  Act
  const product = await createProduct({
    storeId,
    title: "No Description Product",
    // description omitted
    productType: "PHYSICAL",
  });

  //  Assert
  expect(product.description).toBeNull();

expect(productDb.insertProduct).toHaveBeenCalledWith(
  expect.objectContaining({
    storeId,
    title: "No Description Product",
    productType: "PHYSICAL",
  })
);
});

it("should default isFeatured to false", async () => {
  const mockStore = {
    id: storeId,
    deletedAt: null,
    isSuspended: false,
  };

  const createdProduct = {
    id: "product-3",
    storeId,
    title: "Featured Check",
    description: null,
    isFeatured: false, //  expected default
    status: "draft",
  };

  //  Arrange
  vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(
    mockStore as any
  );

  vi.mocked(storeUtils.assertStoreNotSuspended).mockImplementation(
    () => {}
  );

  vi.mocked(productDb.insertProduct).mockResolvedValue(
    createdProduct as any
  );

  //  Act
  const product = await createProduct({
    storeId,
    title: "Featured Check",
    productType: "PHYSICAL",
    // isFeatured omitted
  });

  //  Assert
  expect(product.isFeatured).toBe(false);

 expect(productDb.insertProduct).toHaveBeenCalledWith(
  expect.objectContaining({
    storeId,
    title: "Featured Check",
    productType: "PHYSICAL",
  })
);
});
});