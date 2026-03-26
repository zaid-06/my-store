import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/jobs/job.db", () => ({
  markJobProcessing: vi.fn(),
  markJobCompleted: vi.fn(),
  markJobFailed: vi.fn(),
  markJobRetry: vi.fn(),
}));

import * as jobDb from "../../src/modules/jobs/job.db";
import * as jobRunner from "../../src/modules/jobs/job-runner";

describe("Job Retry Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

it("should mark job as FAILED and increment attempts on error", async () => {
  const job = {
    id: "j1",
    type: "EMAIL",
    payload: {},
    attempts: 0,
  };

  vi.spyOn(console, "error").mockImplementation(() => {});

  //ensure handler is mocked BEFORE execution
  const spy = vi
    .spyOn(jobRunner, "handleEmailJob")
    .mockRejectedValue(new Error("Email failed"));

  await jobRunner.processJob(job as any);

  expect(jobDb.markJobProcessing).toHaveBeenCalledWith("j1");

  // THIS IS CORRECT (retry, not failed)
  expect(jobDb.markJobRetry).toHaveBeenCalledWith(
    "j1",
    "Email failed",
    1
  );

  //  IMPORTANT: ensure handler was actually called
  expect(spy).toHaveBeenCalled();

  spy.mockRestore();
});

 it("should mark job as FAILED permanently after 3 attempts", async () => {
  const job = {
    id: "j2",
    type: "EMAIL",
    payload: {},
    attempts: 2, // already 2 → next = 3 → FAIL
  };

  vi.spyOn(console, "error").mockImplementation(() => {});

  vi.spyOn(jobRunner, "handleEmailJob").mockRejectedValue(
    new Error("Still failing")
  );

  await jobRunner.processJob(job as any);

  //  should FAIL (not retry) 
  expect(jobDb.markJobFailed).toHaveBeenCalledWith(
    "j2",
    "Still failing",
    3
  );
});

  it("should NOT crash runner on failure", async () => {
    const job = {
      id: "j3",
      type: "EMAIL",
      payload: {},
      attempts: 0,
    };

    vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(jobRunner, "handleEmailJob").mockRejectedValue(
      new Error("Crash test")
    );

    await expect(
      jobRunner.processJob(job as any)
    ).resolves.not.toThrow();
  });
});