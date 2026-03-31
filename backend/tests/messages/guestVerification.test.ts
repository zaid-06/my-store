import { describe, it, expect, vi, beforeEach } from "vitest";

// mock order db
vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
}));
vi.mock("../../src/modules/stores/store.db", () => ({
  dbGetStoreById: vi.fn(),
}));

// mock message db
vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationByOrderId: vi.fn(),
  createConversation: vi.fn(),
  createMessage: vi.fn(),
}));

import { sendMessageForOrderService } from "../../src/modules/messages/message.service";

import * as orderDb from "../../src/modules/orders/order.db";
import * as storeDb from "../../src/modules/stores/store.db";

import * as messageDb from "../../src/modules/messages/message.db";

describe("Guest Verification", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });
it("should fail if email does not match order", async () => {
  const orderId = "order1";

  const mockOrder = {
    id: orderId,
    buyerEmail: "buyer@test.com",
    buyerPhone: "9999999999",
    storeId: "store1",
    status: "PAID",
  };

  const mockStore = {
    id: "store1",
    userId: "creator1",
  };

  //  Arrange
  vi.mocked(orderDb.findOrderById).mockResolvedValue(mockOrder as any);

  vi.mocked(storeDb.dbGetStoreById).mockResolvedValue(mockStore as any);

  //  Act + Assert
  await expect(
    sendMessageForOrderService({
      orderId,
      email: "wrong@test.com", //  wrong email
      phone: "9999999999",
      content: "hello",
    })
  ).rejects.toMatchObject({
    message: "Buyer verification failed",
    statusCode: 403,
  });

  //  VERY IMPORTANT: ensure no side effects
  expect(messageDb.findConversationByOrderId).not.toHaveBeenCalled();
  expect(messageDb.createConversation).not.toHaveBeenCalled();
  expect(messageDb.createMessage).not.toHaveBeenCalled();
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
    conversationId: "conv1",
    senderRole: "BUYER",
    senderId: email,
    content: "hello",
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

  // Act
  const result = await sendMessageForOrderService({
    orderId,
    email,
    phone,
    content: "hello",
  });

  //  Assert

  // conversation created
  expect(messageDb.createConversation).toHaveBeenCalledWith({
    orderId,
    storeId: "store1",
    creatorId: "creator1",
    buyerEmail: email,
  });

  // message created correctly
  expect(messageDb.createMessage).toHaveBeenCalledWith({
    conversationId: "conv1",
    senderRole: "BUYER",
    senderId: email,
    content: "hello",
  });

  //  return value (FIXED)
  expect(result).toEqual(createdMessage);
});

});