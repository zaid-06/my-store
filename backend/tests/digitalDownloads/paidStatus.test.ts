import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadService } from "../../src/modules/downloads/download.service";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

describe("PAID Status Enforcement", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject download when order is PENDING", async () => {

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


  it("should allow download when order is PAID", async () => {

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "prod1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: null,
      order: { status: "PAID" }
    } as any);

    vi.spyOn(downloadDb, "getProductFile").mockResolvedValue({
      url: "https://cdn.example.com/file.zip"
    } as any);

    vi.spyOn(downloadDb, "incrementDownloadCount").mockResolvedValue(undefined as any);
    vi.spyOn(downloadDb, "logDownload").mockResolvedValue(undefined as any);

    const result = await getDownloadService(
      "token",
      { ip: "127.0.0.1", headers: {} } as any
    );

    expect(result).toBe("https://cdn.example.com/file.zip");

  });

});