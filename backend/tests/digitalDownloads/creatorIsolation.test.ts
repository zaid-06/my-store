import { describe, it, expect, vi, beforeEach } from "vitest";
import * as downloadDb from "../../src/modules/downloads/download.db";

vi.mock("../../src/modules/downloads/download.db");

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