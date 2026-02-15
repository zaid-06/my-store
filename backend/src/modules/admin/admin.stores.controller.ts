import { Request, Response } from "express";
import * as storeService from "../stores/store.service";

export const listStoresController = async (_req: Request, res: Response) => {
  const stores = await storeService.listStores();
  return res.json(stores);
};

export const getStoreByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const store = await storeService.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  return res.json(store);
};

export const restoreStoreController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const store = await storeService.getStoreById(req.params.id);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }
  if (store.deletedAt == null) {
    return res.status(400).json({
      error: "Store is not deleted; only stores with deletedAt set can be restored",
    });
  }
  const restored = await storeService.restoreStore(req.params.id);
  if (!restored) {
    return res.status(500).json({ error: "Restore failed" });
  }
  return res.json(restored);
};