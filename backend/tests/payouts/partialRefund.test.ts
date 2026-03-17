import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutByOrderId: vi.fn(),
  updatePayoutAmounts: vi.fn(),
  cancelPayout: vi.fn(),
}));

import * as payoutService from "../../src/modules/payouts/payout.service";
import * as payoutDb from "../../src/modules/payouts/payout.db";

describe("Partial Refund Recalculation", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly recalculate payout on partial refund", async () => {

    const payout = {
      id: "p1",
      orderId: "o1",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "LOCKED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o1", 200);

    expect(payoutDb.updatePayoutAmounts).toHaveBeenCalledWith({
      payoutId: "p1",
      grossAmount: 800,
      commissionAmount: 80,
      netAmount: 720,
    });
  });

  it("should apply correct rounding", async () => {

    const payout = {
      id: "p2",
      orderId: "o2",
      grossAmount: "999.99",
      commissionAmount: "99.99",
      netAmount: "900",
      status: "LOCKED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o2", 123.45);

    const callArgs =
      vi.mocked(payoutDb.updatePayoutAmounts).mock.calls[0][0];

    expect(callArgs.grossAmount).toBeCloseTo(876.54, 2);
    expect(callArgs.commissionAmount).toBeCloseTo(87.65, 2);
    expect(callArgs.netAmount).toBeCloseTo(788.89, 2);
  });

  it("should NOT update if payout is RELEASED", async () => {

    const payout = {
      id: "p3",
      orderId: "o3",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "RELEASED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o3", 200);

    expect(payoutDb.updatePayoutAmounts).not.toHaveBeenCalled();
    expect(payoutDb.cancelPayout).not.toHaveBeenCalled();
  });

  it("should cancel payout on full refund", async () => {

    const payout = {
      id: "p4",
      orderId: "o4",
      grossAmount: "1000",
      commissionAmount: "100",
      netAmount: "900",
      status: "LOCKED",
    };

    vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

    await payoutService.adjustPayoutAfterRefund("o4", 1000);

    expect(payoutDb.cancelPayout).toHaveBeenCalledWith("p4");
    expect(payoutDb.updatePayoutAmounts).not.toHaveBeenCalled();
  });

 it("should cancel payout if refund exceeds gross amount", async () => {

  const payout = {
    id: "p5",
    orderId: "o5",
    grossAmount: "100",
    commissionAmount: "10",
    netAmount: "90",
    status: "LOCKED",
  };

  vi.mocked(payoutDb.findPayoutByOrderId).mockResolvedValue(payout as any);

  await payoutService.adjustPayoutAfterRefund("o5", 200);

  expect(payoutDb.cancelPayout).toHaveBeenCalledWith("p5");
});

});