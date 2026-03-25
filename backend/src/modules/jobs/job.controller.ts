
import { Request, Response } from "express";
import * as jobService from "./job.service";

export const getAllJobsController = async (req: Request, res: Response) => {
  const jobs = await jobService.listAllJobsService();

  res.status(200).json({
    success: true,
    data: jobs,
  });
};