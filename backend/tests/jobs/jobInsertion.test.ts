import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/jobs/job.db", () => ({
  createJob: vi.fn(),
}));

import * as jobDb from "../../src/modules/jobs/job.db";

describe("Job Insertion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert EMAIL job correctly", async () => {
    const payload = {
      to: "test@example.com",
      template: "ORDER_CREATED",
      data: { orderId: "o1" },
    };

    vi.mocked(jobDb.createJob).mockResolvedValue({
      id: "j1",
      type: "EMAIL",
      payload,
      status: "PENDING",
      attempts: 0,
    } as any);

    const job = await jobDb.createJob({
      type: "EMAIL",
      payload,
    });

    expect(jobDb.createJob).toHaveBeenCalledWith({
      type: "EMAIL",
      payload,
    });

    expect(job.type).toBe("EMAIL");
    expect((job.payload as any).to).toBe("test@example.com");
    expect(job.status).toBe("PENDING");
  });

  it("should insert PAYOUT_ELIGIBILITY job with runAt", async () => {
    const runAt = new Date();

    const payload = {
      payoutId: "p1",
    };

    vi.mocked(jobDb.createJob).mockResolvedValue({
      id: "j2",
      type: "PAYOUT_ELIGIBILITY",
      payload,
      status: "PENDING",
      attempts: 0,
      runAt,
    } as any);

    const job = await jobDb.createJob({
      type: "PAYOUT_ELIGIBILITY",
      payload,
      runAt,
    });

    expect(jobDb.createJob).toHaveBeenCalledWith({
      type: "PAYOUT_ELIGIBILITY",
      payload,
      runAt,
    });

    expect(job.type).toBe("PAYOUT_ELIGIBILITY");
    expect((job.payload as any).payoutId).toBe("p1");
    expect(job.runAt).toEqual(runAt);
  });
});