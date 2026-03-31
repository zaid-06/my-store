import { Request, Response } from "express";
import * as storeService from "../stores/store.service";
import { successResponse } from "../../shared/response";
import { ApiError } from "../../shared/api-error";
export const listStoresController = async (_req: Request, res: Response) => {
  const stores = await storeService.listStores();
  return res.json(successResponse(stores));
};

export const getStoreByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const store = await storeService.getStoreById(req.params.id);
  if (!store) {
    throw new ApiError("Store not found", 404);
  }
  return res.json(successResponse(store));

};

export const restoreStoreController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const storeId = req.params.id;

  const restored = await storeService.restoreStore(storeId);

  return res.json(successResponse(restored));
};