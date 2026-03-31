import { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import * as storeService from "./store.service";
import { auth } from "../auth/auth.config";

//  * Controller to create a new store for the authenticated user
import { createStoreSchema } from "./store.schema";
import { ApiError } from "../../shared/api-error";
import { successResponse } from "../../shared/response";
import { updateStoreSchema } from "./store.schema";

export const createStoreController = async (req: Request, res: Response) => {
  const userId = req.user!.id;


  //  ZOD VALIDATION
  const parsed = createStoreSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(parsed.error.message, 400);
  }

  // CALL SERVICE (NO LOGIC HERE)
  const store = await storeService.createStoreService(
    userId,
    parsed.data
  );

  return res.json(successResponse(store));
};



//  * Controller to get the authenticated user's store
export const getMyStoreController = async (req: Request, res: Response) => {
    const userId = req.user!.id;

  const store = await storeService.getStoreByUserId(userId);
  return res.json(successResponse(store));
};

//  * Controller to get a public store by username
export const getPublicStoreController = async (
  req: Request<{ username: string }>,
  res: Response
  ) => {
  const store = await storeService.getPublicStoreService(
    req.params.username
  );

  return res.json(successResponse(store));
};

export const updateStoreController = async (req: Request, res: Response) => {
  

  const userId = req.user!.id;
   // 🔥 enforce immutability BEFORE parsing
  if ("username" in req.body) {
    throw new ApiError("Username cannot be changed", 400);
  }

  // ZOD VALIDATION (partial update)
  const parsed = updateStoreSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(parsed.error.message, 400);
  }

  const store = await storeService.updateStoreService(
    userId,
    parsed.data
  );

  return res.json(successResponse(store));
};

export const deleteMyStoreController = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await storeService.deleteMyStoreService(
    userId
  );

  return res.status(200).json(successResponse(result));
};


// task 9 
export const suspendStoreController = async (
  req: Request<{ id: string }, {}, { reason: string }>,
  res: Response
) => {
  const userId = req.user!.id;

  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError("Suspension reason is required", 400);
  }

  const result = await storeService.suspendStoreService({
    storeId: req.params.id,
    reason: reason.trim(),
    adminId: userId,
  });

  return res.json(successResponse(result));
};

export const unsuspendStoreController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const userId = req.user!.id;



  const result = await storeService.unsuspendStoreService({
    storeId: req.params.id,
    adminId: userId,
  });

  return res.json(successResponse(result));
};