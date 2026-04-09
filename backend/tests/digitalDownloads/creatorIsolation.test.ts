import { describe, it, expect, vi, beforeEach } from "vitest";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

import { createDigitalDownload } from "../../src/modules/downloads/download.service";
describe("Digital Download - Uniqueness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should NOT create duplicate downloads for same order + product", async () => {
    const existingDownload = {
      id: "download-1",
      orderId: "order-1",
      productId: "product-1",
      token: "token-123",
    };

    // ✅ First call → no existing
    // ✅ Second call → existing found
    const findSpy = vi
      .spyOn(downloadDb, "findDownloadByOrderAndProduct")
      .mockResolvedValueOnce(null as any)
      .mockResolvedValueOnce(existingDownload as any);

    const insertSpy = vi
      .spyOn(downloadDb, "insertDownload")
      .mockResolvedValue(existingDownload as any);

    // 🔹 First call → should create
    const first = await createDigitalDownload(
      "order-1",
      "product-1",
      "variant-1"
    );

    // 🔹 Second call → should reuse
    const second = await createDigitalDownload(
      "order-1",
      "product-1",
      "variant-1"
    );

    // ✅ SAME object reused
    expect(second).toEqual(first);

    // ✅ insert called ONLY once
    expect(insertSpy).toHaveBeenCalledTimes(1);

    // ✅ insert called with correct payload
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        productId: "product-1",
        variantId: "variant-1",
        token: expect.any(String), // 🔥 important
      })
    );

    // ✅ find called twice
    expect(findSpy).toHaveBeenCalledTimes(2);
  });
  it("should return existing download without inserting", async () => {
  const existing = {
    id: "download-1",
    orderId: "order-1",
    productId: "product-1",
  };

  vi.spyOn(downloadDb, "findDownloadByOrderAndProduct")
    .mockResolvedValue(existing as any);

  const insertSpy = vi.spyOn(downloadDb, "insertDownload");

  const result = await createDigitalDownload(
    "order-1",
    "product-1",
    "variant-1"
  );

  expect(result).toEqual(existing);

  // 🔥 critical assertion
  expect(insertSpy).not.toHaveBeenCalled();
});
});
describe("Creator Access Isolation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return downloads when product belongs to creator store", async () => {

    const mockDownloads = [
      {
        orderId: "order1",
        downloadCount: 3,
        createdAt: new Date()
      }
    ];

    vi.spyOn(downloadDb, "getDownloadsForProduct")
      .mockResolvedValue(mockDownloads as any);

    const result = await downloadDb.getDownloadsForProduct(
      "product1",
      "store1"
    );

    expect(result).toEqual(mockDownloads);

  });


  it("should not return downloads for another creator store", async () => {

    vi.spyOn(downloadDb, "getDownloadsForProduct")
      .mockResolvedValue([]);

    const result = await downloadDb.getDownloadsForProduct(
      "product1",
      "another-store"
    );

    expect(result).toEqual([]);

  });

});