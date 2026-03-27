import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "./store.service";
import { auth } from "../auth/auth.config";

//  * Controller to create a new store for the authenticated user
import { createStoreSchema } from "./store.schema";
import { ApiError } from "../../shared/api-error";

import { updateStoreSchema } from "./store.schema";

export const createStoreController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  //  ZOD VALIDATION
  const parsed = createStoreSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(parsed.error.message, 400);
  }

  // CALL SERVICE (NO LOGIC HERE)
  const store = await storeService.createStoreService(
    session.user.id,
    parsed.data
  );

  return res.json(store);
};



//  * Controller to get the authenticated user's store
export const getMyStoreController = async (req: Request, res: Response) => {
  console.log("in getMyStoreController...............")
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }
  const store = await storeService.getStoreByUserId(session.user.id);
  return res.json(store);
};

//  * Controller to get a public store by username
export const getPublicStoreController = async (
  req: Request<{ username: string }>,
  res: Response
) => {
  const store = await storeService.getPublicStoreService(
    req.params.username
  );

  return res.json(store);
};

export const updateStoreController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  // ZOD VALIDATION (partial update)
  const parsed = updateStoreSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(parsed.error.message, 400);
  }

  const store = await storeService.updateStoreService(
    session.user.id,
    parsed.data
  );

  return res.json(store);
};

export const deleteMyStoreController = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    throw new ApiError("Unauthorized", 401);
  }

  const result = await storeService.deleteMyStoreService(
    session.user.id
  );

  return res.status(200).json(result);
};


// task 9 
export const suspendStoreController = async (
  req: Request<{ id: string }, {}, { reason: string }>,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.body?.reason) {
    return res.status(400).json({ error: "Suspension reason required" });
  }

  const result = await storeService.suspendStoreService({
    storeId: req.params.id,
    reason: req.body.reason,
    adminId: session.user.id,
  });

  return res.json(result);
};

export const unsuspendStoreController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await storeService.unsuspendStoreService({
    storeId: req.params.id,
    adminId: session.user.id,
  });

  return res.json(result);
};