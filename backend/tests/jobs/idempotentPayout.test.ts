import { describe, it, expect, vi, beforeEach } from "vitest";

//  mock modules
vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutById: vi.fn(),
  markPayoutEligible: vi.fn(),
}));

vi.mock("../../src/modules/jobs/job.db", () => ({
  markJobProcessing: vi.fn(),
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
  markJobRetry: vi.fn(),
}));

import * as payoutDb from "../../src/modules/payouts/payout.db";
import * as jobDb from "../../src/modules/jobs/job.db";
import * as jobRunner from "../../src/modules/jobs/job-runner";

describe("Idempotent Payout Eligibility Processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should NOT update payout if already ELIGIBLE", async () => {
    const job = {
      id: "job-idem-1",
      type: "PAYOUT_ELIGIBILITY",
      payload: { payoutId: "p1" },
      attempts: 0,
    };

    const mockPayout = {
      id: "p1",
      status: "ELIGIBLE", // 🔥 already processed
      eligibleAt: new Date(Date.now() - 1000),
    };

    vi.spyOn(payoutDb, "findPayoutById").mockResolvedValue(mockPayout as any);

    await jobRunner.processJob(job as any);

    //  should NOT update again
    expect(payoutDb.markPayoutEligible).not.toHaveBeenCalled();

    //  but job still completes
    expect(jobDb.markJobCompleted).toHaveBeenCalledWith("job-idem-1");
  });

  it("should NOT update payout if already RELEASED", async () => {
    const job = {
      id: "job-idem-2",
      type: "PAYOUT_ELIGIBILITY",
      payload: { payoutId: "p2" },
      attempts: 0,
    };

    const mockPayout = {
      id: "p2",
      status: "RELEASED",
      eligibleAt: new Date(),
    };

    vi.spyOn(payoutDb, "findPayoutById").mockResolvedValue(mockPayout as any);

    await jobRunner.processJob(job as any);

    expect(payoutDb.markPayoutEligible).not.toHaveBeenCalled();
    expect(jobDb.markJobCompleted).toHaveBeenCalledWith("job-idem-2");
  });

  it("should NOT update payout if CANCELLED", async () => {
    const job = {
      id: "job-idem-3",
      type: "PAYOUT_ELIGIBILITY",
      payload: { payoutId: "p3" },
      attempts: 0,
    };

    const mockPayout = {
      id: "p3",
      status: "CANCELLED",
      eligibleAt: new Date(),
    };

    vi.spyOn(payoutDb, "findPayoutById").mockResolvedValue(mockPayout as any);

    await jobRunner.processJob(job as any);

    expect(payoutDb.markPayoutEligible).not.toHaveBeenCalled();
    expect(jobDb.markJobCompleted).toHaveBeenCalledWith("job-idem-3");
  });
});