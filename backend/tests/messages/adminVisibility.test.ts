import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/messages/message.db", () => ({
  getAdminConversations: vi.fn(),
}));

import { listAdminConversationsService } from "../../src/modules/messages/message.service";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Admin Full Visibility", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow admin to see all conversations", async () => {

    const conversations = [
      {
        id: "conv1",
        storeId: "store1",
        isDisputed: false,
      },
      {
        id: "conv2",
        storeId: "store2",
        isDisputed: true,
      },
    ];

    vi.mocked(messageDb.getAdminConversations).mockResolvedValue(conversations as any);

    const result = await listAdminConversationsService({});

    expect(result.length).toBe(2);
    expect(result[0].id).toBe("conv1");
    expect(result[1].id).toBe("conv2");

    expect(messageDb.getAdminConversations).toHaveBeenCalledTimes(1);
  });

});