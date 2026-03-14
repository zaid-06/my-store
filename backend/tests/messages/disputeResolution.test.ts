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

    vi.mocked(messageDb.findConversationById).mockResolvedValue({
      id: "conv1",
      isDisputed: true,
    } as any);

    vi.mocked(messageDb.setConversationDispute).mockResolvedValue({
      id: "conv1",
      isDisputed: false,
    } as any);

    const result = await resolveDisputeService("conv1");

    expect(result.data.isDisputed).toBe(false);
    expect(messageDb.setConversationDispute).toHaveBeenCalledTimes(1);
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