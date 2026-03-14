import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/stores/store.db", () => ({
  dbGetStoreByUserId: vi.fn(),
}));

vi.mock("../../src/modules/messages/message.db", () => ({
  findConversationById: vi.fn(),
  getMessagesByConversationId: vi.fn(),
}));

import { getConversationService } from "../../src/modules/messages/message.service";

import * as storeDb from "../../src/modules/stores/store.db";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Creator Isolation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block creator from accessing another store conversation", async () => {

    vi.mocked(storeDb.dbGetStoreByUserId).mockResolvedValue({
      id: "store1",
    } as any);

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      storeId: "store2", // different store
    } as any);

    await expect(
      getConversationService({
        creatorId: "creator1",
        conversationId: "conv1",
      })
    ).rejects.toThrow("Access denied to this conversation");

  });

  it("should allow creator to access their own conversation", async () => {

    vi.mocked(storeDb.dbGetStoreByUserId).mockResolvedValue({
      id: "store1",
    } as any);

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      storeId: "store1",
    } as any);

    vi.mocked(messageDb.getMessagesByConversationId).mockResolvedValue([]);

    const result = await getConversationService({
      creatorId: "creator1",
      conversationId: "conv1",
    });

    expect(result.conversation.id).toBe("conv1");

  });

});