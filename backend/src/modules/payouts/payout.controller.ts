import { Request, Response } from "express";
import {
  listCreatorPayoutsService,
  getPayoutSummaryService,
  listAllPayoutsAdminService,
  releasePayoutService,
  cancelPayoutService,
  freezePayoutService,
  unfreezePayoutService,
 } from "./payout.service";

import { successResponse } from "../../shared/response";

export const listCreatorPayoutsController = async (
  req: Request,
  res: Response
) => {
  const creatorId = req.user!.id;

  const { status, startDate, endDate } = req.query;

  const payouts = await listCreatorPayoutsService({
    creatorId,
    status: status as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  });

  return res.json(successResponse(payouts));
};



export const getPayoutSummaryController = async (
  req: Request,
  res: Response
) => {

  const creatorId = req.user!.id;
  const summary = await getPayoutSummaryService(creatorId);

  return res.json(successResponse(summary));
};



export const listAllPayoutsAdminController = async (
  req: Request,
  res: Response
) => {

  const { storeId, status, startDate, endDate } = req.query;

  const payouts = await listAllPayoutsAdminService({
    storeId: storeId as string | undefined,
    status: status as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  });

  return res.json(successResponse(payouts));
};



export const releasePayoutController = async (
  req: Request,
  res: Response
) => {
  const adminId = req.user!.id;
  const payoutId = req.params.id;
  const payout = await releasePayoutService(
    payoutId as string,
    adminId
  );

  return res.json(
    successResponse({
      message: "Payout released",
      payout,
    })
  );
};


export const cancelPayoutController = async (
  req: Request,
  res: Response
) => {

  const payoutId = req.params.id;

  const payout = await cancelPayoutService(payoutId as string);

  
 return res.json(successResponse(payout));
};



export const freezePayoutController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const adminId = req.user!.id;

  const result = await freezePayoutService({
    payoutId: req.params.id,
    adminId,
  });

 return res.json(successResponse(result));
};

export const unfreezePayoutController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
 
  const adminId = req.user!.id;

  const result = await unfreezePayoutService({
    payoutId: req.params.id,
    adminId: adminId,
  });

  return res.json(successResponse(result));
};