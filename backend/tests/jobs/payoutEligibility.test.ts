import { describe, it, expect, vi, beforeEach } from "vitest";

// mock DB
vi.mock("../../src/modules/payouts/payout.db", () => ({
  findPayoutById: vi.fn(),
  markPayoutEligible: vi.fn(), //  use this
}));

vi.mock("../../src/modules/jobs/job.db", () => ({
  markJobProcessing: vi.fn(),
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
  markJobRetry: vi.fn(), //  ADD THIS
}));

import * as payoutDb from "../../src/modules/payouts/payout.db";
import * as jobDb from "../../src/modules/jobs/job.db";
import * as jobRunner from "../../src/modules/jobs/job-runner";

it("should transition payout from LOCKED → ELIGIBLE", async () => {
  const job = {
    id: "job1",
    type: "PAYOUT_ELIGIBILITY",
    payload: { payoutId: "p1" },
    attempts: 0,
  };

  const mockPayout = {
    id: "p1",
    status: "LOCKED",
    eligibleAt: new Date(Date.now() - 1000),
  };

  vi.spyOn(payoutDb, "findPayoutById").mockResolvedValue(mockPayout as any);

  await jobRunner.processJob(job as any);

  expect(payoutDb.findPayoutById).toHaveBeenCalledWith("p1");

  // THIS IS THE FIX
  expect(payoutDb.markPayoutEligible).toHaveBeenCalledWith("p1");

  expect(jobDb.markJobCompleted).toHaveBeenCalledWith("job1");
});