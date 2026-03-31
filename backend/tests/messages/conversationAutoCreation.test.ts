import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
}));
vi.mock("../../src/modules/stores/store.db", () => ({
  dbGetStoreById: vi.fn(),
}));
vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationByOrderId: vi.fn(),
  createConversation: vi.fn(),
  createMessage: vi.fn(),
}));

import { sendMessageForOrderService } from "../../src/modules/messages/message.service";

import * as storeDb from "../../src/modules/stores/store.db";
import * as orderDb from "../../src/modules/orders/order.db";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Conversation Auto Creation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create conversation if none exists", async () => {
  const orderId = "order1";
  const email = "buyer@test.com";
  const phone = "9999999999";

  const mockOrder = {
    id: orderId,
    buyerEmail: email,
    buyerPhone: phone,
    storeId: "store1",
    status: "PAID",
  };

  const mockStore = {
    id: "store1",
    userId: "creator1",
  };

  const createdConversation = {
    id: "conv1",
  };

  const createdMessage = {
    id: "msg1",
    content: "hello",
    conversationId: "conv1",
  };

  //  Arrange
  vi.mocked(orderDb.findOrderById).mockResolvedValue(mockOrder as any);

  vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

  vi.mocked(messageDb.findConversationByOrderId).mockResolvedValue(undefined);

  vi.mocked(messageDb.createConversation).mockResolvedValue(
    createdConversation as any
  );

  vi.mocked(messageDb.createMessage).mockResolvedValue(
    createdMessage as any
  );

  //  Act
  const result = await sendMessageForOrderService({
    orderId,
    email,
    phone,
    content: "hello",
  });

  //  Assert

  // conversation should be created
  expect(messageDb.createConversation).toHaveBeenCalledTimes(1);

  expect(messageDb.createConversation).toHaveBeenCalledWith({
    orderId,
    storeId: "store1",
    creatorId: "creator1", // 🔥 important: derived from store
    buyerEmail: email,
  });

  // message should be created using new conversation
  expect(messageDb.createMessage).toHaveBeenCalledWith({
    conversationId: "conv1",
    senderRole: "BUYER",
    senderId: email,
    content: "hello",
  });

  // final return
  expect(result).toEqual(createdMessage);
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