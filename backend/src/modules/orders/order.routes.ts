import { Router } from "express";
import { createOrderController } from "./order.controller";

export const orderRoutes = Router();

import { Role } from "../../types/roles";
import {rateLimiter} from "../../middlewares/rateLimiter";

import {requireMerchant} from "../../middlewares/requireMerchant";
import {
  getCreatorOrdersController,
  getCreatorOrderController,
  updateOrderStatusController,
  markOrderRefundController
 } from "./order.controller";
import { requireAuth } from "../auth/auth.middleware";

orderRoutes.post("/",
   rateLimiter,
   createOrderController
);

orderRoutes.get(
  "/",
  requireAuth,
  requireMerchant,
  getCreatorOrdersController
);




orderRoutes.get(
  "/:id",
  requireAuth,
  requireMerchant,
  getCreatorOrderController
);





orderRoutes.patch(
  "/:id/status",
  requireAuth,
  requireMerchant,
  updateOrderStatusController
);



orderRoutes.patch(
  "/:id/refund",
  requireAuth,
  requireMerchant,
  markOrderRefundController
);

