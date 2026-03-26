import * as jobDb from "./job.db";
import * as payoutDb from "../payouts/payout.db";
import * as emailService from "../email/email.service";

const POLLING_INTERVAL = 30 * 1000; // 30 seconds

export const startJobRunner = () => {
  console.log(" ************** Job Runner started.............");

  setInterval(async () => {
    try {
      const jobs = await jobDb.getPendingJobs();
         console.log("in job runner  .*********************************")

      for (const job of jobs) {
        await processJob(job);
         console.log("in job runner, I am in the for loop ...........................................")
      }

    } catch (err) {
      console.error(" Job runner failed:", err);
    }
  }, POLLING_INTERVAL);
};

// PROCESS SINGLE JOB

export const processJob = async (job: any) => {
  try {
    // mark as PROCESSING
    await jobDb.markJobProcessing(job.id);

    /*
      HANDLE JOB TYPES  
    */
    if (job.type === "EMAIL") {
      // await handleEmailJob(job);
      await exports.handleEmailJob(job);
    }

    if (job.type === "PAYOUT_ELIGIBILITY") {
      await exports.handlePayoutEligibilityJob(job);
    }

    // SUCCESS
    await jobDb.markJobCompleted(job.id);

  } catch (error: any) {
    console.error(`Job failed: ${job.id}`, error);

    const attempts = job.attempts + 1;

    //  RETRY LOGIC
    if (attempts >= 3) {
      await jobDb.markJobFailed(
        job.id,
        error?.message || "Unknown error",
        attempts
      );
    } else {
      await jobDb.markJobRetry(
        job.id,
        error?.message || "Unknown error",
        attempts
      );
    }
  }
};


// EMAIL JOB


export  const handleEmailJob = async (job: any) => {
  const { to, template, data } = job.payload;

  await emailService.sendEmail(to, template, data);
};



//PAYOUT ELIGIBILITY JOB


export const handlePayoutEligibilityJob = async (job: any) => {
  const { payoutId } = job.payload;

  const payout = await payoutDb.findPayoutById(payoutId);

  if (!payout) return;

  // already processed cases → silently complete
  if (
    payout.status === "CANCELLED" ||
    payout.status === "RELEASED" ||
    payout.status === "ELIGIBLE"
  ) {
    return;
  }

  // only process LOCKED
  if (payout.status !== "LOCKED") return;

  const now = new Date();

  if (new Date(payout.eligibleAt) <= now) {
    await payoutDb.markPayoutEligible(payout.id);
  }
};
