import { describe, it, expect, vi, afterEach } from "vitest";

// 🔥 MOCK MODULES FIRST
vi.mock("@/modules/stores/store.db", () => ({
  dbGetStoreById: vi.fn(),
  dbGetStoreByUserId: vi.fn(),
}));

vi.mock("@/modules/orders/order.db", () => ({
  findPublishedProductForOrder: vi.fn(),
  findStoreById: vi.fn(),
  findVariantForOrder: vi.fn(),
  findBuyerByEmailAndPhone: vi.fn(),
  createBuyer: vi.fn(),
  insertOrder: vi.fn(),
}));

vi.mock("@/modules/messages/message.db", () => ({
  findConversationById: vi.fn(),
  findOrderById: vi.fn(),
  createMessage: vi.fn(),
}));

// ✅ IMPORT AFTER MOCKS
import * as storeDb from "@/modules/stores/store.db";
import * as orderDb from "@/modules/orders/order.db";
import * as messageDb from "@/modules/messages/message.db";

import { createProduct } from "@/modules/products/product.service";
import { createOrder } from "@/modules/orders/order.service";
import { sendCreatorMessageService } from "@/modules/messages/message.service";

describe("Task 9 - Store Suspension Blocking", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const suspendedStore = {
    id: "store_1",
    isSuspended: true,
    isPublic: true,
    isVacationMode: false,
  };

  // =========================
  // 🧪 PRODUCT CREATION
  // =========================
  it("should block product creation if store is suspended", async () => {
    (storeDb.dbGetStoreById as any).mockResolvedValue(suspendedStore);

    await expect(
      createProduct({
        storeId: "store_1",
        title: "Test Product",
        productType: "PHYSICAL",
      })
    ).rejects.toThrow("Store is suspended");
  });

  // =========================
  // 🧪 ORDER CREATION
  // =========================
  it("should block order creation if store is suspended", async () => {

    // product exists
    (orderDb.findPublishedProductForOrder as any).mockResolvedValue({
      id: "prod_1",
      storeId: "store_1",
    });

    // store is suspended
    (orderDb.findStoreById as any).mockResolvedValue(suspendedStore);

    await expect(
      createOrder({
        productId: "prod_1",
        variantId: "var_1",
        quantity: 1,
        buyerName: "Zaid",
        buyerEmail: "test@test.com",
        buyerPhone: "123",
        shippingAddress: "addr",
        paymentMethod: "COD",
      } as any)
    ).rejects.toThrow("Store is suspended");
  });

  // =========================
  // 🧪 MESSAGE SENDING
  // =========================
  it("should block creator message if store is suspended", async () => {

    (storeDb.dbGetStoreByUserId as any).mockResolvedValue(suspendedStore);

    await expect(
      sendCreatorMessageService({
        creatorId: "user_1",
        conversationId: "conv_1",
        content: "hello",
      })
    ).rejects.toThrow("Store is suspended");
  });

});