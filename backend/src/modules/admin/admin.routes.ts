import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import {
  listStoresController,
  getStoreByIdController,
  restoreStoreController,
} from "./admin.stores.controller";
import { listAdminOrdersController,
  adminOverrideOrderStatusController,
  adminSoftDeleteOrderController ,
  adminMarkOrderRefundController 
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
import { requireAdmin } from "../../middlewares/requireAdmin";
// const requireAdmin = [requireAuth, requireRole(Role.ADMIN)];

adminRoutes.get("/stores",
  requireAuth,
  requireAdmin,
  listStoresController
);  
adminRoutes.get("/stores/:id",
   requireAuth,
   requireAdmin,
   getStoreByIdController
);

adminRoutes.patch("/stores/:id/restore",
  requireAuth,
  requireAdmin,
  restoreStoreController
);

adminRoutes.get(
  "/orders",
  requireAuth,
  requireAdmin,
  listAdminOrdersController
);

adminRoutes.patch(
  "/orders/:id/status",
  requireAuth,
  requireAdmin,
  adminOverrideOrderStatusController
);

adminRoutes.post(
  "/orders/:id/refund",
  requireAuth,
  requireAdmin,
  adminMarkOrderRefundController
);

adminRoutes.delete(
  "/orders/:id",
  requireAuth,
  requireAdmin,
  adminSoftDeleteOrderController
);

adminRoutes.get(
  "/downloads",
  requireAuth,
  requireAdmin,
  listAllDownloadsController
);

adminRoutes.patch(
  "/messages/:conversationId/resolve",
  requireAuth,
  requireAdmin,
  resolveDispute
);

adminRoutes.get(
  "/messages",
  requireAuth,
  requireAdmin,
  listAdminConversations
);

adminRoutes.get(
  "/messages/:conversationId",
  requireAuth,
 
  requireAdmin,
  
  getAdminConversation
);

adminRoutes.delete(
  "/messages/:messageId",
  requireAuth,
  requireAdmin,
  softDeleteMessage
);

// Payout Routes
adminRoutes.get(
  "/payouts",
  requireAuth,
  requireAdmin,
  listAllPayoutsAdminController
);

adminRoutes.patch(
  "/payouts/:id/release",
  requireAuth,
  requireAdmin,
  releasePayoutController
);

adminRoutes.patch(
  "/payouts/:id/cancel",
  requireAuth,
  requireAdmin,
  cancelPayoutController
);

adminRoutes.get(
  "/jobs",
  requireAuth,
  requireAdmin,
  getAllJobsController
);

adminRoutes.patch(
  "/stores/:id/suspend",
  requireAuth,
  requireAdmin,
  suspendStoreController
);
  

adminRoutes.patch(
  "/stores/:id/unsuspend",
   requireAuth,
  requireAdmin,
  unsuspendStoreController
);
// freeze 
adminRoutes.patch(
  "/payouts/:id/freeze",
   requireAuth,
  requireAdmin,
  freezePayoutController
);
adminRoutes.patch(
  "/payouts/:id/freeze",
   requireAuth,
  requireAdmin,
  freezePayoutController
);


adminRoutes.patch(
  "/payouts/:id/unfreeze",
  requireAuth,
  requireAdmin,
  unfreezePayoutController
);
export default adminRoutes;

