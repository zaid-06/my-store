import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";




vi.mock("../../src/modules/orders/order.db", () => ({
  findOrderById: vi.fn(),
 
}));


vi.mock("../../src/modules/payouts/payout.db", () => ({
  
   getLockedPayouts: vi.fn(),
   markPayoutEligible: vi.fn(),
}));


import * as payoutService from "../../src/modules/payouts/payout.service";
import * as payoutDb from "../../src/modules/payouts/payout.db";
import * as orderDb from "../../src/modules/orders/order.db";

// vi.mock("../../src/modules/orders/order.db");
// vi.mock("../../src/modules/payouts/payout.db");

describe("Eligibility Timing Logic", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

   it("should mark payout as ELIGIBLE when eligibleAt has passed", async () => {

  const now = new Date("2026-01-10T00:00:00Z");
  vi.setSystemTime(now);

  const payout = {
    id: "p1",
    status: "LOCKED",
    eligibleAt: new Date("2026-01-01T00:00:00Z"),
    orderId: "o1", //  REQUIRED
  };

  vi.mocked(payoutDb.getLockedPayouts).mockResolvedValue([payout as any]);

  //  MOCK ORDER DB
  vi.mocked(orderDb.findOrderById).mockResolvedValue({
    id: "o1",
    status: "DELIVERED",
    totalAmount: "1000",
    refundAmount: "0",
  } as any);

  vi.mocked(payoutDb.markPayoutEligible).mockResolvedValue(undefined as any);

  await payoutService.updateEligiblePayouts();

  expect(payoutDb.markPayoutEligible).toHaveBeenCalledWith("p1");
});

  it("should NOT mark payout as ELIGIBLE if eligibleAt not reached", async () => {

    const now = new Date("2026-01-01T00:00:00Z");
    vi.setSystemTime(now);

    const payout = {
      id: "p2",
      status: "LOCKED",
      eligibleAt: new Date("2026-01-10T00:00:00Z"),
      orderStatus: "DELIVERED",
    };

    vi.mocked(payoutDb.getLockedPayouts).mockResolvedValue([payout as any]);

    await payoutService.updateEligiblePayouts();

    expect(payoutDb.markPayoutEligible).not.toHaveBeenCalled();
  });

  it("should NOT mark payout if order is not DELIVERED", async () => {

  const now = new Date("2026-01-10T00:00:00Z");
  vi.setSystemTime(now);

  const payout = {
    id: "p3",
    status: "LOCKED",
    eligibleAt: new Date("2026-01-01T00:00:00Z"),
    orderId: "o3", //  REQUIRED
  };

  vi.mocked(payoutDb.getLockedPayouts).mockResolvedValue([payout as any]);

  //  IMPORTANT: mock orderDb
  vi.mocked(orderDb.findOrderById).mockResolvedValue({
    id: "o3",
    status: "CANCELLED", // 👈 key condition
    totalAmount: "1000",
    refundAmount: "0",
  } as any);

  await payoutService.updateEligiblePayouts();

  expect(payoutDb.markPayoutEligible).not.toHaveBeenCalled();
});

});