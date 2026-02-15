import { Router } from "express";
import { Role } from "../../types/roles";

import {
  createStoreController,
  getMyStoreController,
  getPublicStoreController,
  updateStoreController,
   deleteMyStoreController,
} from "./store.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";

export const storeRoutes = Router();

storeRoutes.post("/", requireAuth, requireRole(Role.CREATOR), createStoreController);
storeRoutes.get("/me", requireAuth, getMyStoreController);
storeRoutes.patch("/me", requireAuth, updateStoreController);
storeRoutes.delete("/me", requireAuth, deleteMyStoreController);

storeRoutes.get("/:username", getPublicStoreController);


