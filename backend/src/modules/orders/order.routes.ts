import { Router } from "express";
import { createOrderController } from "./order.controller";

export const orderRoutes = Router();

import { Role } from "../../types/roles";

orderRoutes.post("/", createOrderController);

import {
  getCreatorOrdersController,
  getCreatorOrderController,
  updateOrderStatusController,
  markOrderRefundController
 } from "./order.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";


orderRoutes.get(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  getCreatorOrdersController
);




orderRoutes.get(
  "/:id",
  requireAuth,
  requireRole(Role.CREATOR),
  getCreatorOrderController
);





orderRoutes.patch(
  "/:id/status",
  requireAuth,
  requireRole(Role.CREATOR),
  updateOrderStatusController
);



orderRoutes.patch(
  "/:id/refund",
  requireAuth,
  requireRole(Role.CREATOR),
  markOrderRefundController
);

