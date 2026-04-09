import { Router } from "express";

import {
  createStoreController,
  getMyStoreController,
  getPublicStoreController,
  updateStoreController,
   deleteMyStoreController,
} from "./store.controller";
import { requireAuth } from "../auth/auth.middleware";
import { 
  listPublishedProductsByStoreController,
   getSinglePublishedProductController,
  } from "../products/product.controller";

export const storeRoutes = Router();

storeRoutes.post("/", requireAuth, createStoreController);
storeRoutes.get("/me", requireAuth, getMyStoreController);
storeRoutes.patch("/me", requireAuth, updateStoreController);
storeRoutes.delete("/me", requireAuth, deleteMyStoreController);

storeRoutes.get("/:username", getPublicStoreController);


storeRoutes.get(
  "/:username/products",
  listPublishedProductsByStoreController
);



storeRoutes.get(
  "/:username/products/:productId",
  getSinglePublishedProductController
)