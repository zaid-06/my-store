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


import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.config";
export const listCreatorPayoutsController = async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session?.user?.id) {return res.status(401).json({ error: "Unauthorized" });}
    const creatorId = session?.user.id

  const { status, startDate, endDate } = req.query;

  const payouts = await listCreatorPayoutsService({
    creatorId,
    status: status as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
  });

  res.json({
    data: payouts,
  });
};



export const getPayoutSummaryController = async (
  req: Request,
  res: Response
) => {

  const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user?.id) {return res.status(401).json({ error: "Unauthorized" });}
  const creatorId = session?.user.id

  const summary = await getPayoutSummaryService(creatorId);

  return res.json(summary);
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

  res.json({
    data: payouts,
  });
};


// export const releasePayoutController = async (
//   req: Request,
//   res: Response
// ) => {

//   const payoutId = req.params.id;

//   const payout = await releasePayoutService(payoutId as string);

//   return res.json({
//     message: "Payout released",
//     data: payout,
//   });
// };
export const releasePayoutController = async (
  req: Request,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payoutId = req.params.id;
// const adminId = session.user.id;
  const payout = await releasePayoutService(
    payoutId as string,
    session.user.id //  PASS ADMIN ID
  );

  return res.json({
    message: "Payout released",
    data: payout,
  });
};


export const cancelPayoutController = async (
  req: Request,
  res: Response
) => {

  const payoutId = req.params.id;

  const payout = await cancelPayoutService(payoutId as string);

  res.json({
    message: "Payout cancelled",
    data: payout,
  });
};



export const freezePayoutController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await freezePayoutService({
    payoutId: req.params.id,
    adminId: session.user.id,
  });

  return res.json(result);
};

export const unfreezePayoutController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await unfreezePayoutService({
    payoutId: req.params.id,
    adminId: session.user.id,
  });

  return res.json(result);
};