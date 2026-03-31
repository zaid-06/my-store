import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/modules/downloads/download.db", () => ({
  getDownloadByToken: vi.fn(),
  incrementDownloadCount: vi.fn(),
  logDownload: vi.fn(),
}));

vi.mock("@/modules/products/product.db", () => ({
  getProductFile: vi.fn(),
}));

import * as downloadDb from "@/modules/downloads/download.db";
import * as productDb from "@/modules/products/product.db";

import { getDownloadService } from "@/modules/downloads/download.service";

describe("Task 9 - Download Guardrail (Refund)", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should block download if order is fully refunded", async () => {

    (downloadDb.getDownloadByToken as any).mockResolvedValue({
      id: "dl_1",
      productId: "prod_1",
      downloadCount: 0,
      maxDownloads: null,
      expiresAt: null,
      order: {
        status: "PAID",
        totalAmount: "100",
        refundAmount: "100", //  fully refunded
      },
    });

    await expect(
      getDownloadService("token_1", {
        ip: "127.0.0.1",
        headers: {},
      } as any)
    ).rejects.toThrow("fully refunded");
  });

 

});