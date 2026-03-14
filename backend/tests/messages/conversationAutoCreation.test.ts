import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
}));

vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationByOrderId: vi.fn(),
  createConversation: vi.fn(),
  createMessage: vi.fn(),
}));

import { sendMessageForOrderService } from "../../src/modules/messages/message.service";

import * as orderDb from "../../src/modules/orders/order.db";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Conversation Auto Creation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create conversation if none exists", async () => {

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
      storeId: "store1",
      status: "PAID",
    } as any);

    // conversation not found
    vi.mocked(messageDb.findConversationByOrderId).mockResolvedValue(undefined );

    vi.mocked(messageDb.createConversation).mockResolvedValue({
      id: "conv1",
    } as any);

    vi.mocked(messageDb.createMessage).mockResolvedValue({
      id: "msg1",
      content: "hello",
    } as any);

    await sendMessageForOrderService({
      orderId: "order1",
      email: "buyer@test.com",
      phone: "9999999999",
      content: "hello",
    });

    expect(messageDb.createConversation).toHaveBeenCalledTimes(1);
  });

  it("should NOT create conversation if one already exists", async () => {

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
      storeId: "store1",
      status: "PAID",
    } as any);

    // conversation already exists
    vi.mocked(messageDb.findConversationByOrderId).mockResolvedValue({
      id: "conv1",
    } as any);

    vi.mocked(messageDb.createMessage).mockResolvedValue({
      id: "msg1",
      content: "hello",
    } as any);

    await sendMessageForOrderService({
      orderId: "order1",
      email: "buyer@test.com",
      phone: "9999999999",
      content: "hello",
    });

    expect(messageDb.createConversation).not.toHaveBeenCalled();
  });

});