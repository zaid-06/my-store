import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutById: vi.fn(),
  releasePayout: vi.fn(),
}));

import * as payoutService from "../../src/modules/payouts/payout.service";
import * as payoutDb from "../../src/modules/payouts/payout.db";

describe("Release Payout Idempotency", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should release payout if status is ELIGIBLE", async () => {

    const payout = {
      id: "p1",
      status: "ELIGIBLE",
    };

    vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

    await payoutService.releasePayoutService("p1");

    expect(payoutDb.releasePayout).toHaveBeenCalledWith("p1");
  });

  it("should NOT release payout if already RELEASED (idempotent)", async () => {

    const payout = {
      id: "p2",
      status: "RELEASED",
    };

    vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

    await payoutService.releasePayoutService("p2");

    expect(payoutDb.releasePayout).not.toHaveBeenCalled();
  });
it("should throw error if payout is LOCKED", async () => {

  const payout = {
    id: "p3",
    status: "LOCKED",
  };

  vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

  await expect(
    payoutService.releasePayoutService("p3")
  ).rejects.toThrow("Payout not eligible for release");

});

  it("should throw error if payout is CANCELLED", async () => {

  const payout = {
    id: "p4",
    status: "CANCELLED",
  };

  vi.mocked(payoutDb.findPayoutById).mockResolvedValue(payout as any);

  await expect(
    payoutService.releasePayoutService("p4")
  ).rejects.toThrow("Payout not eligible for release");

});

  it("should throw error if payout not found", async () => {

    vi.mocked(payoutDb.findPayoutById).mockResolvedValue(null);

    await expect(
      payoutService.releasePayoutService("p5")
    ).rejects.toThrow("Payout not found");
  });

});