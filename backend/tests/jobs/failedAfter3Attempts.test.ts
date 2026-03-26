import { describe, it, expect, vi, beforeEach } from "vitest";

//  mock job.db
vi.mock("../../src/modules/jobs/job.db", () => ({
  markJobProcessing: vi.fn(),
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
  markJobRetry: vi.fn(),
}));

import * as jobDb from "../../src/modules/jobs/job.db";
import * as jobRunner from "../../src/modules/jobs/job-runner";

describe("Failed Job After 3 Attempts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mark job as FAILED permanently after 3 attempts", async () => {
    const job = {
      id: "job-fail-1",
      type: "EMAIL",
      payload: {
        to: "test@example.com",
        template: "ORDER_CREATED",
        data: {},
      },
      attempts: 2, // critical: already 2 → next = 3
    };

    // force failure
    vi.spyOn(jobRunner, "handleEmailJob").mockRejectedValue(
      new Error("Final failure")
    );

    await jobRunner.processJob(job as any);

    // processing started
    expect(jobDb.markJobProcessing).toHaveBeenCalledWith("job-fail-1");

    // should NOT retry
    expect(jobDb.markJobRetry).not.toHaveBeenCalled();

    // should FAIL permanently
    expect(jobDb.markJobFailed).toHaveBeenCalledWith(
      "job-fail-1",
      "Final failure",
      3
    );
  });
});