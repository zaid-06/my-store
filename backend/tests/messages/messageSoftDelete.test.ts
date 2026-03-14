import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/messages/message.db", () => ({
  findMessageById: vi.fn(),
  softDeleteMessageById: vi.fn(),
}));

import { softDeleteMessageService } from "../../src/modules/messages/message.service";
import * as messageDb from "../../src/modules/messages/message.db";

describe("Message Soft Delete", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should soft delete a message", async () => {

    vi.mocked(messageDb.findMessageById).mockResolvedValue({
      id: "msg1",
      content: "hello",
      deletedAt: null,
    } as any);

    vi.mocked(messageDb.softDeleteMessageById).mockResolvedValue({
      id: "msg1",
      deletedAt: new Date(),
    } as any);

    const result = await softDeleteMessageService("msg1");

    expect(result.id).toBe("msg1");
    expect(messageDb.softDeleteMessageById).toHaveBeenCalledTimes(1);
  });

  it("should fail if message does not exist", async () => {

    vi.mocked(messageDb.findMessageById).mockResolvedValue(undefined);

    await expect(
      softDeleteMessageService("msg1")
    ).rejects.toThrow("Message not found");

  });

});