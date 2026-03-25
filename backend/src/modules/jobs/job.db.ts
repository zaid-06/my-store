import { db } from "../../config/db";

import { jobs } from "./job.schema";
import { eq, and, lte } from "drizzle-orm";

// CREATE JOB

// export const createJob = async ({
//   type,
//   payload,
//   runAt,
// }: {
//   type: "EMAIL" | "PAYOUT_ELIGIBILITY";
//   payload: any;
//   runAt?: Date;
// }) => {
//   const [job] = await db
//     .insert(jobs)
//     .values({
//       type,
//       payload,
//       status: "PENDING",
//       attempts: 0,
//       runAt: runAt ?? new Date(),
//     })
//     .returning();

//   return job;
// };


import { createJobSchema } from "./job.schema";

export const createJob = async (input: {
  type: "EMAIL" | "PAYOUT_ELIGIBILITY";
  payload: any;
  runAt?: Date;
}) => {

  // ✅ VALIDATION (MANDATORY)
  const validated = createJobSchema.parse(input);

  const [job] = await db
    .insert(jobs)
    .values({
      type: validated.type,
      payload: validated.payload,
      status: "PENDING",
      attempts: 0,
      runAt: validated.runAt ?? new Date(),
    })
    .returning();

  return job;
};

// GET PENDING JOBS

export const getPendingJobs = async () => {
  return db.query.jobs.findMany({
    where: and(
      eq(jobs.status, "PENDING"),
      lte(jobs.runAt, new Date())
    ),
    orderBy: (jobs, { asc }) => [asc(jobs.createdAt)],
    limit: 10, // batch 
  });
};


    
// MARK PROCESSING

export const markJobProcessing = async (jobId: string) => {
  await db
    .update(jobs)
    .set({
      status: "PROCESSING",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
};

// MARK COMPLETED

export const markJobCompleted = async (jobId: string) => {
  await db
    .update(jobs)
    .set({
      status: "COMPLETED",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
};

// MARK FAILED (WITH RETRY)

export const markJobFailed = async (
  jobId: string,
  error: string,
  attempts: number
) => {
  const isFinalFailure = attempts >= 3;

  await db
    .update(jobs)
    .set({
      status: isFinalFailure ? "FAILED" : "PENDING",
      attempts,
      lastError: error,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
};
export const markJobRetry = async (
  jobId: string,
  error: string,
  attempts: number
) => {
  await db
    .update(jobs)
    .set({
      status: "PENDING",
      attempts,
      lastError: error,
    })
    .where(eq(jobs.id, jobId));
};

// GET JOB BY ID (OPTIONAL)

export const findJobById = async (jobId: string) => {
  return db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });
};

export const getAllJobs = async () => {
  return db.query.jobs.findMany({
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
  });
};