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
import { requireAuth, requireRole } from "../auth/auth.middleware";

const router = Router();

router.post("/order/:orderId", sendMessageForOrder);
router.get("/order/:orderId", getMessagesForOrder);
router.patch("/:conversationId/dispute", escalateDispute);
router.get(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  listCreatorConversations
);

router.get(
  "/:conversationId",
  requireAuth,
  requireRole(Role.CREATOR),
  getConversation
);

router.post(
  "/:conversationId",
  requireAuth,
  requireRole(Role.CREATOR),
  sendCreatorMessage
);

export default router;



