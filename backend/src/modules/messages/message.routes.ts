import { Router } from "express";
import {
  sendMessageForOrder,
  getMessagesForOrder,
  escalateDispute,
  listCreatorConversations,
  getConversation,
  sendCreatorMessage,
} from "./message.controller";
import { Role } from "../../types/roles";
import { requireAuth } from "../auth/auth.middleware";
import { rateLimiter } from "../../middlewares/rateLimiter";
import { requireMerchant } from "../../middlewares/requireMerchant";
const router = Router();

router.post("/order/:orderId",
  rateLimiter,
  sendMessageForOrder
);
router.get("/order/:orderId", getMessagesForOrder);
router.patch("/:conversationId/dispute", escalateDispute);
router.get(
  "/",
  requireAuth,
  // requireRole(Role.CREATOR),
  requireMerchant,
  listCreatorConversations
);

router.get(
  "/:conversationId",
  requireAuth,
  requireMerchant,
  getConversation
);

router.post(
  "/:conversationId",
  requireAuth,
  requireMerchant,
  rateLimiter,
  sendCreatorMessage
);

export default router;



