import { Router } from "express";
import { Role } from "../../types/roles";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import {
  listStoresController,
  getStoreByIdController,
  restoreStoreController,
} from "./admin.stores.controller";
import { listAdminOrdersController,
  adminOverrideOrderStatusController,
  adminSoftDeleteOrderController  
} from "./admin.order.controller";

const adminRoutes = Router();

// All admin routes require auth + ADMIN role
const requireAdmin = [requireAuth, requireRole(Role.ADMIN)];

adminRoutes.get("/stores", ...requireAdmin, listStoresController);
adminRoutes.get("/stores/:id", ...requireAdmin, getStoreByIdController);
adminRoutes.patch("/stores/:id/restore", ...requireAdmin, restoreStoreController);
adminRoutes.get(
  "/orders",
  requireAuth,
  requireRole(Role.ADMIN),
  listAdminOrdersController
);



adminRoutes.patch(
  "/orders/:id/status",
  requireAuth,
  requireRole(Role.CREATOR),
  adminOverrideOrderStatusController
);



adminRoutes.delete(
  "/orders/:id",
  requireAuth,
  requireRole(Role.CREATOR),
  adminSoftDeleteOrderController
);



export default adminRoutes;