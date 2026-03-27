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
import { listAllDownloadsController } from "../downloads/download.controller";
import {
  resolveDispute ,
  listAdminConversations,
  getAdminConversation,
  softDeleteMessage,
} from "../messages/message.controller";
import { 
  listAllPayoutsAdminController, 
  releasePayoutController,
  cancelPayoutController,
  freezePayoutController,
  unfreezePayoutController

 } from "../payouts/payout.controller";
import { getAllJobsController } from "../jobs/job.controller";
import { suspendStoreController } from "../stores/store.controller";
import { unsuspendStoreController } from "../stores/store.controller";
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
  requireRole(Role.ADMIN),
  adminOverrideOrderStatusController
);



adminRoutes.delete(
  "/orders/:id",
  requireAuth,
  // requireRole(Role.CREATOR),//temp creator for checking
  requireRole(Role.ADMIN),

  adminSoftDeleteOrderController
);



adminRoutes.get(
  "/downloads",
  requireAuth,
  requireRole(Role.ADMIN),
  listAllDownloadsController
);
adminRoutes.patch(
  "/messages/:conversationId/resolve",
  requireAuth,
  requireRole(Role.ADMIN),
  resolveDispute
);

adminRoutes.get(
  "/messages",
  requireAuth,
  requireRole(Role.ADMIN),
  listAdminConversations
);

adminRoutes.get(
  "/messages/:conversationId",
  requireAuth,
  requireRole(Role.ADMIN),
  getAdminConversation
);

adminRoutes.delete(
  "/messages/:messageId",
  requireAuth,
  requireRole(Role.ADMIN),
  softDeleteMessage
);

// Payout Routes

adminRoutes.get(
  "/payouts",
  requireAuth,

  requireRole(Role.ADMIN),
  listAllPayoutsAdminController
);


adminRoutes.patch(
  "/payouts/:id/release",
  requireAuth,
  requireRole(Role.ADMIN),
  releasePayoutController
);



adminRoutes.patch(
  "/payouts/:id/cancel",
  requireAuth,
  requireRole(Role.ADMIN),
  cancelPayoutController
);

adminRoutes.get(
  "/jobs",
  requireAuth,
  requireRole(Role.ADMIN),
  getAllJobsController
);

adminRoutes.patch(
  "/stores/:id/suspend",

  requireAuth,
  requireRole(Role.ADMIN),
  suspendStoreController
);
  

adminRoutes.patch(
  "/stores/:id/unsuspend",
   requireAuth,
  requireRole(Role.ADMIN),
  unsuspendStoreController
);
// freeze 
adminRoutes.patch(
  "/payouts/:id/freeze",
   requireAuth,
  requireRole(Role.ADMIN),
  freezePayoutController
);
adminRoutes.patch(
  "/payouts/:id/freeze",
   requireAuth,
  requireRole(Role.ADMIN),
  freezePayoutController
);


adminRoutes.patch(
  "/payouts/:id/unfreeze",
  requireAuth,
  requireRole(Role.ADMIN),
  unfreezePayoutController
);
export default adminRoutes;

