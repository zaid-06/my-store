import { describe, it, expect, vi, beforeEach } from "vitest";

/*
 HOISTED MOCKS (guaranteed before imports)
*/
const mocks = vi.hoisted(() => ({
  dbGetStoreByUserId: vi.fn(),
  listPayoutsByStore: vi.fn(),
  getPayoutSummaryByStore: vi.fn(),
}));

vi.mock("../../src/modules/stores/store.db", () => ({
  dbGetStoreByUserId: mocks.dbGetStoreByUserId,
}));

vi.mock("../../src/modules/payouts/payout.db", () => ({
  listPayoutsByStore: mocks.listPayoutsByStore,
  getPayoutSummaryByStore: mocks.getPayoutSummaryByStore,
}));

/*
 IMPORT AFTER MOCKS
*/
import * as payoutService from "../../src/modules/payouts/payout.service";

describe("Creator Isolation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return only payouts for creator's store", async () => {

    mocks.dbGetStoreByUserId.mockResolvedValue({
      id: "store-1",
      userId: "creator-1",
    });

    mocks.listPayoutsByStore.mockResolvedValue([
      { id: "p1", storeId: "store-1" },
    ]);

    const result = await payoutService.listCreatorPayoutsService({
      creatorId: "creator-1",
    });

    expect(result).toEqual([{ id: "p1", storeId: "store-1" }]);
  });

  it("should NOT allow access if creator has no store", async () => {

    mocks.dbGetStoreByUserId.mockResolvedValue(null);

    await expect(
      payoutService.listCreatorPayoutsService({
        creatorId: "creator-2",
      })
    ).rejects.toThrow("Store not found");
  });

  it("should return correct payout summary for creator", async () => {

    mocks.dbGetStoreByUserId.mockResolvedValue({
      id: "store-3",
    });

    mocks.getPayoutSummaryByStore.mockResolvedValue({
      totalGross: 1000,
      totalCommission: 100,
      totalNet: 900,
      lockedAmount: 300,
      eligibleAmount: 400,
      releasedAmount: 200,
    });

    const result = await payoutService.getPayoutSummaryService("creator-3");

    expect(result.totalNet).toBe(900);
  });

});