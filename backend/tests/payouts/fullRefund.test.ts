import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutByOrderId: vi.fn(),
  cancelPayout: vi.fn(),
  updatePayoutAmounts: vi.fn(),
}));

import * as payoutService from "../../src/modules/payouts/payout.service";
import * as payoutDb from "../../src/modules/payouts/payout.db";

describe("Full Refund Cancellation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel payout on full refund", async () => {

    const payout = {
      id: "p1",
      orderId: "o1",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "LOCKED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o1", 1000);

    expect(payoutDb.cancelPayout).toHaveBeenCalledWith("p1");
    expect(payoutDb.updatePayoutAmounts).not.toHaveBeenCalled();
  });

  it("should cancel payout if refund exceeds gross amount", async () => {

    const payout = {
      id: "p2",
      orderId: "o2",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "LOCKED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o2", 1200);

    expect(payoutDb.cancelPayout).toHaveBeenCalledWith("p2");
  });

  it("should NOT cancel if payout already RELEASED", async () => {

    const payout = {
      id: "p3",
      orderId: "o3",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "RELEASED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o3", 1000);

    expect(payoutDb.cancelPayout).not.toHaveBeenCalled();
  });

  it("should do nothing if payout does not exist", async () => {

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(null as any);

    await payoutService.adjustPayoutAfterRefund("o4", 1000);

    expect(payoutDb.cancelPayout).not.toHaveBeenCalled();
    expect(payoutDb.updatePayoutAmounts).not.toHaveBeenCalled();
  });

});