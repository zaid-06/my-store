

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadService } from "../../src/modules/downloads/download.service";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

describe("Download Access Validation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if token is invalid", async () => {

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue(null as any);

    await expect(
      getDownloadService(
        "invalid-token",
        { ip: "127.0.0.1", headers: {} } as any
      )
    ).rejects.toThrow("Invalid download token");

  });

  it("should throw error if order is not PAID", async () => {

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "prod1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: null,
      order: { status: "PENDING" }
    } as any);

    await expect(
      getDownloadService(
        "token",
        { ip: "127.0.0.1", headers: {} } as any
      )
    ).rejects.toThrow("Order not paid");

  });

  it("should throw error if order is CANCELLED", async () => {

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "prod1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: null,
      order: { status: "CANCELLED" }
    } as any);

    await expect(
      getDownloadService(
        "token",
        { ip: "127.0.0.1", headers: {} } as any
      )
    ).rejects.toThrow("Order cancelled");

  });

});