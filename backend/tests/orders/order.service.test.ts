import { describe, it, expect, vi, beforeEach } from "vitest";



vi.mock("@/modules/orders/order.db", () => ({
  insertOrder: vi.fn(),
  findPublishedProductForOrder: vi.fn(),
  findStoreById: vi.fn(),
  findVariantForOrder: vi.fn(),          // ➜ add this
  findBuyerByEmailAndPhone: vi.fn(),     // used in createOrder
  createBuyer: vi.fn(),                  // used in createOrder
}));
vi.mock("@/modules/products/product.db", () => ({
  findProductById: vi.fn(),
}));

vi.mock("@/modules/stores/store.db", () => ({
  dbGetStoreById: vi.fn(),
}));

/* ====================================================== */

import { createOrder } from "@/modules/orders/order.service";
import * as orderDb from "@/modules/orders/order.db";
import * as productDb from "@/modules/products/product.db";
import * as storeDb from "@/modules/stores/store.db";
import { ApiError } from "@/shared/api-error";

describe("Order Module - Order Creation (Unit)", () => {

  const validInput = {
    productId: "prod-1",
    variantId: "var-1",
    quantity: 2,
    buyerName: "John Doe",
    buyerEmail: "john@test.com",
    buyerPhone: "1234567890",
    shippingAddress: {} as any,
    paymentMethod: "COD" as "COD",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });



it("should create order successfully", async () => {
  vi.mocked(orderDb.findPublishedProductForOrder).mockResolvedValue({
    id: "prod-1",
    price: "100.00",
    storeId: "store-1",
  } as any);

  vi.mocked(orderDb.findStoreById).mockResolvedValue({
    id: "store-1",
    isPublic: true,
    isOnVacation: false,
  } as any);

  vi.mocked(orderDb.findVariantForOrder).mockResolvedValue({
    id: "var-1",
    productId: "prod-1",
    price: "100.00",
  } as any);

  vi.mocked(orderDb.findBuyerByEmailAndPhone).mockResolvedValue({
    id: "buyer-1",
  } as any);

  vi.mocked(orderDb.insertOrder).mockResolvedValue({
    id: "order-1",
    totalAmount: "200.00",
  } as any);

  const result = await createOrder(validInput);

  expect(result.orderId).toBe("order-1");
});

  /* =====================================================
     2️⃣ PRODUCT NOT FOUND
  ===================================================== */
it("should throw if product not found", async () => {

  vi.mocked(orderDb.findPublishedProductForOrder)
    .mockResolvedValue(null);

  await expect(createOrder(validInput))
    .rejects
    .toBeInstanceOf(ApiError);

});
 it("should block unpublished product", async () => {

  // Simulate unpublished product (DB does not return it)
  vi.mocked(orderDb.findPublishedProductForOrder)
    .mockResolvedValue(null);

  await expect(createOrder(validInput))
    .rejects
    .toBeInstanceOf(ApiError);

});

  // /* =====================================================
  //    4️⃣ STORE PRIVATE
  // ===================================================== */

  it("should block private store", async () => {

  // 🟢 Product exists
  vi.mocked(orderDb.findPublishedProductForOrder)
    .mockResolvedValue({
      id: "prod-1",
      price: "100.00",
      storeId: "store-1",
    } as any);

  // 🔴 Store is private
  vi.mocked(orderDb.findStoreById)
    .mockResolvedValue({
      id: "store-1",
      isPublic: false,
      isOnVacation: false,
    } as any);

  await expect(createOrder(validInput))
    .rejects
    .toBeInstanceOf(ApiError);

});



it("should block ordering during vacation mode", async () => {

  // 🟢 Product exists
  vi.mocked(orderDb.findPublishedProductForOrder)
    .mockResolvedValue({
      id: "prod-1",
      price: "100.00",
      storeId: "store-1",
    } as any);

  // 🔴 Store in vacation mode
  vi.mocked(orderDb.findStoreById)
    .mockResolvedValue({
      id: "store-1",
      isPublic: true,
      isVacationMode: true, // ✅ correct field name
    } as any);

  await expect(createOrder(validInput))
    .rejects
    .toThrow("Store is in vacation mode");

});


  // /* =====================================================
  //    6️⃣ PRICE FREEZING VALIDATION
  // ===================================================== */

it("should freeze product price at time of order", async () => {

  // 🟢 Product exists
  vi.mocked(orderDb.findPublishedProductForOrder)
    .mockResolvedValue({
      id: "prod-1",
      price: "150.00",   // 🔥 current price
      storeId: "store-1",
    } as any);

  // 🟢 Store is valid
  vi.mocked(orderDb.findStoreById)
    .mockResolvedValue({
      id: "store-1",
      isPublic: true,
      isVacationMode: false,
    } as any);

  // 🟢 Variant exists
  vi.mocked(orderDb.findVariantForOrder)
    .mockResolvedValue({
      id: "var-1",
      productId: "prod-1",
      price: "150.00",  // 🔥 variant price
    } as any);

  // 🟢 Buyer exists
  vi.mocked(orderDb.findBuyerByEmailAndPhone)
    .mockResolvedValue({
      id: "buyer-1",
    } as any);

  // 👇 Spy on insertOrder
  const insertSpy = vi.mocked(orderDb.insertOrder)
    .mockResolvedValue({
      id: "order-1",
      totalAmount: "300.00",
    } as any);

  await createOrder(validInput);

  // 🔥 IMPORTANT ASSERTION
 expect(insertSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    priceAtPurchase: "150",
  })
);

});

});

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
