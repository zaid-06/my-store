
import { Request, Response } from "express";
import * as jobService from "./job.service";
import { successResponse } from "../../shared/response";
export const getAllJobsController = async (
  req: Request,
  res: Response
) => {
  const jobs = await jobService.listAllJobsService();

  return res.status(200).json(successResponse(jobs));
};