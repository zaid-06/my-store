import { describe, it, expect, vi, beforeEach } from "vitest";

// mock order db
vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
}));

// mock message db
vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationByOrderId: vi.fn(),
  createConversation: vi.fn(),
  createMessage: vi.fn(),
}));

import { sendMessageForOrderService } from "../../src/modules/messages/message.service";

import * as orderDb from "../../src/modules/orders/order.db";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Guest Verification", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail if email does not match order", async () => {

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
      storeId: "store1",
      status: "PAID",
    } as any);

    await expect(
      sendMessageForOrderService({
        orderId: "order1",
        email: "wrong@test.com",
        phone: "9999999999",
        content: "hello",
      })
    ).rejects.toThrow("Buyer verification failed");

  });

  it("should fail if phone does not match order", async () => {

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
      storeId: "store1",
      status: "PAID",
    } as any);

    await expect(
      sendMessageForOrderService({
        orderId: "order1",
        email: "buyer@test.com",
        phone: "8888888888",
        content: "hello",
      })
    ).rejects.toThrow("Buyer verification failed");

  });

  it("should allow message when email and phone match", async () => {

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
      storeId: "store1",
      status: "PAID",
    } as any);

    vi.mocked(messageDb.findConversationByOrderId).mockResolvedValue(undefined);

    vi.mocked(messageDb.createConversation).mockResolvedValue({
      id: "conv1",
    } as any);

    vi.mocked(messageDb.createMessage).mockResolvedValue({
      id: "msg1",
      content: "hello",
    } as any);

    const result = await sendMessageForOrderService({
      orderId: "order1",
      email: "buyer@test.com",
      phone: "9999999999",
      content: "hello",
    });

    expect(result.message).toBe("Message sent");
    expect(messageDb.createConversation).toHaveBeenCalled();
    expect(messageDb.createMessage).toHaveBeenCalled();
  });

});