import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDownloadService } from "../../src/modules/downloads/download.service";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

describe("Download Count Increment", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should increment download count and log download on successful download", async () => {

    // mock download record
    vi.spyOn(downloadDb, "getDownloadByToken").mockResolvedValue({
      id: "download1",
      productId: "product1",
      downloadCount: 2,
      maxDownloads: null,
      expiresAt: null,
      order: { status: "PAID" }
    } as any);

    // mock file retrieval
    vi.spyOn(downloadDb, "getProductFile").mockResolvedValue({
      url: "https://cdn.example.com/file.zip"
    } as any);

    // mock increment + log
    const incrementSpy = vi
      .spyOn(downloadDb, "incrementDownloadCount")
      .mockResolvedValue(undefined as any);

    const logSpy = vi
      .spyOn(downloadDb, "logDownload")
      .mockResolvedValue(undefined as any);

    const req = {
      ip: "127.0.0.1",
      headers: {
        "user-agent": "vitest"
      }
    } as any;

    const result = await getDownloadService("token", req);

    // verify url returned
    expect(result).toBe("https://cdn.example.com/file.zip");

    // verify increment called
    expect(incrementSpy).toHaveBeenCalledWith("download1", 2);

    // verify log called
    expect(logSpy).toHaveBeenCalledWith(
      "download1",
      "127.0.0.1",
      "vitest"
    );

  });

});