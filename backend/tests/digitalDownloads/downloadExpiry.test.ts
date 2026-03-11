import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadService } from "../../src/modules/downloads/download.service";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

describe("Download Expiry Logic", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if download link is expired", async () => {

    const pastDate = new Date(Date.now() - 1000 * 60); // 1 minute ago

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "product1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: pastDate,
      order: { status: "PAID" }
    } as any);

    await expect(
      getDownloadService(
        "token",
        { ip: "127.0.0.1", headers: {} } as any
      )
    ).rejects.toThrow("Download expired");

  });

  it("should allow download if link is not expired", async () => {

    const futureDate = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes future

    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "product1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: futureDate,
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