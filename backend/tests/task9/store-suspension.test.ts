


import { describe, it, expect, vi, afterEach } from "vitest";
vi.mock("@/modules/stores/store.db", () => ({
  dbGetStoreByUserId: vi.fn(),
}));

import * as storeDb from "@/modules/stores/store.db";
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
  };

  // 🧪 PRODUCT
//     it("should block product creation if store is suspended", async () => {
//     (storeDb.dbGetStoreByUserId as any).mockResolvedValue({
//       id: "store_1",
//       isSuspended: true,
//     });

//     await expect(
//       createProduct({
//         userId: "user_1",
//         name: "Test Product",
//       } as any)
//     ).rejects.toThrow("Store is suspended");
//   });

  // 🧪 ORDER
//   it("should block order creation if store is suspended", async () => {
//     vi.spyOn(storeDb, "dbGetStoreByUserId")
//       .mockResolvedValue(suspendedStore as any);

//     await expect(
//       createOrder({
//         userId: "user_1",
//         productId: "prod_1",
//       } as any)
//     ).rejects.toThrow("Store is suspended");
//   });

  // 🧪 MESSAGE
  it("should block creator message if store is suspended", async () => {
    vi.spyOn(storeDb, "dbGetStoreByUserId")
      .mockResolvedValue(suspendedStore as any);

    await expect(
      sendCreatorMessageService({
        creatorId: "user_1",
        conversationId: "conv_1",
        content: "hello",
      })
    ).rejects.toThrow("Store is suspended");
  });

});