import * as jobDb from "./job.db";

export const listAllJobsService = async () => {
  const jobs = await jobDb.getAllJobs();
  return jobs;
};