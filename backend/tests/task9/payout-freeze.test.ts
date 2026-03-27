import { describe, it, expect, vi, afterEach } from "vitest";

// 🔥 MOCKS
vi.mock("@/modules/payouts/payout.db", () => ({
  findPayoutWithCreator: vi.fn(),
  releasePayout: vi.fn(),
}));

vi.mock("@/modules/jobs/job.db", () => ({
  createJob: vi.fn(),
}));

// ✅ IMPORT AFTER MOCKS
import * as payoutDb from "@/modules/payouts/payout.db";
import { releasePayoutService } from "@/modules/payouts/payout.service";

describe("Task 9 - Payout Freeze Enforcement", () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const frozenPayout = {
    id: "payout_1",
    isFrozen: true,
    status: "ELIGIBLE",
    netAmount: "100",
    store: {
      user: {
        email: "test@test.com",
      },
    },
  };

  const normalPayout = {
    id: "payout_1",
    isFrozen: false,
    status: "ELIGIBLE",
    netAmount: "100",
    store: {
      user: {
        email: "test@test.com",
      },
    },
  };

  // =========================
  // 🧪 BLOCK RELEASE IF FROZEN
  // =========================
  it("should block payout release if payout is frozen", async () => {
    (payoutDb.findPayoutWithCreator as any).mockResolvedValue(frozenPayout);

    await expect(
      releasePayoutService("payout_1", "admin_1")
    ).rejects.toThrow("Payout is frozen");
  });

  // =========================
  // 🧪 ALLOW RELEASE IF NOT FROZEN
  // =========================
  it("should allow payout release if not frozen", async () => {
    (payoutDb.findPayoutWithCreator as any).mockResolvedValue(normalPayout);

    (payoutDb.releasePayout as any).mockResolvedValue({
      ...normalPayout,
      status: "RELEASED",
    });

    const result = await releasePayoutService("payout_1", "admin_1");

    expect(result.status).toBe("RELEASED");
  });

  // =========================
  // 🧪 IDEMPOTENCY CHECK
  // =========================
  it("should not re-release already released payout", async () => {
    (payoutDb.findPayoutWithCreator as any).mockResolvedValue({
      ...normalPayout,
      status: "RELEASED",
    });

    const result = await releasePayoutService("payout_1", "admin_1");

    expect(result.status).toBe("RELEASED");
  });

});