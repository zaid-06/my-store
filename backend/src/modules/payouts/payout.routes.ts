import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { listCreatorPayoutsController,
  getPayoutSummaryController,
  
 } from "./payout.controller";
import { Role } from "../../types/roles";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  listCreatorPayoutsController
);



router.get(
  "/summary",
  requireAuth,
  requireRole(Role.CREATOR),
  getPayoutSummaryController
);




export default router;