import { describe, it, expect, vi, beforeEach } from "vitest";

//  mock dependencies
vi.mock("../../src/modules/email/email.service", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../src/modules/jobs/job.db", () => ({
  markJobProcessing: vi.fn(),
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
  markJobRetry: vi.fn(),
}));

import * as emailService from "../../src/modules/email/email.service";
import * as jobDb from "../../src/modules/jobs/job.db";
import * as jobRunner from "../../src/modules/jobs/job-runner";

describe("Email Job Completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process EMAIL job and mark as COMPLETED", async () => {
    const job = {
      id: "job-email-1",
      type: "EMAIL",
      payload: {
        to: "test@example.com",
        template: "ORDER_CREATED",
        data: { orderId: "o1" },
      },
      attempts: 0,
    };

    //  mock email sending success
    vi.spyOn(emailService, "sendEmail").mockResolvedValue(undefined);

    await jobRunner.processJob(job as any);

    //  processing started
    expect(jobDb.markJobProcessing).toHaveBeenCalledWith("job-email-1");

    //  email sent
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "ORDER_CREATED",
      { orderId: "o1" }
    );

    //  job completed
    expect(jobDb.markJobCompleted).toHaveBeenCalledWith("job-email-1");
  });
});