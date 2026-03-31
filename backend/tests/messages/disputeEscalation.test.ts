import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationById: vi.fn(),
  setConversationDispute: vi.fn(),
}));

vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
}));

import { escalateDisputeService } from "../../src/modules/messages/message.service";

import * as messageDb from "../../src/modules/messages/message.db";
import * as orderDb from "../../src/modules/orders/order.db";

describe("Dispute Escalation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should escalate dispute if conversation is not disputed", async () => {

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      orderId: "order1",
      isDisputed: false,
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
    } as any);

    vi.mocked(orderDb.findOrderById).mockResolvedValue({
      id: "order1",
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
    } as any);

    vi.mocked(messageDb.setConversationDispute).mockResolvedValue({
      id: "conv1",
      isDisputed: true,
    } as any);

    const result = await escalateDisputeService({
      conversationId: "conv1",
      email: "buyer@test.com",
      phone: "9999999999",
    });

    expect(result.isDisputed).toBe(true);
    expect(messageDb.setConversationDispute).toHaveBeenCalledTimes(1);
  });

  it("should fail if conversation already disputed", async () => {

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      orderId: "order1",
      isDisputed: true,
      buyerEmail: "buyer@test.com",
      buyerPhone: "9999999999",
    } as any);

    await expect(
      escalateDisputeService({
        conversationId: "conv1",
        email: "buyer@test.com",
        phone: "9999999999",
      })
    ).rejects.toThrow("Conversation already disputed");

  });

});