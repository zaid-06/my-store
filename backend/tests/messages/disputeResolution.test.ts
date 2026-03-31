import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationById: vi.fn(),
  setConversationDispute: vi.fn(),
}));

import { resolveDisputeService } from "../../src/modules/messages/message.service";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Dispute Resolution", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

it("should resolve dispute if conversation is disputed", async () => {
  const conversationId = "conv1";

  const existingConversation = {
    id: conversationId,
    isDisputed: true,
  };

  const updatedConversation = {
    id: conversationId,
    isDisputed: false,
  };

  // Arrange
  vi.mocked(messageDb.findConversationById).mockResolvedValue(
    existingConversation as any
  );

  vi.mocked(messageDb.setConversationDispute).mockResolvedValue(
    updatedConversation as any
  );

  // Act
  const result = await resolveDisputeService(conversationId);

  // Assert

  // correct lookup
  expect(messageDb.findConversationById).toHaveBeenCalledWith(conversationId);

  // correct update call (VERY IMPORTANT)
  expect(messageDb.setConversationDispute).toHaveBeenCalledWith(
    conversationId,
    false
  );

  expect(messageDb.setConversationDispute).toHaveBeenCalledTimes(1);

  // correct return
  expect(result).toEqual(updatedConversation);
});

  it("should fail if conversation is not disputed", async () => {

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      isDisputed: false,
    } as any);

    await expect(
      resolveDisputeService("conv1")
    ).rejects.toThrow("Conversation is not disputed");

  });

});