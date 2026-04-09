import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { listCreatorPayoutsController,
  getPayoutSummaryController,
  
 } from "./payout.controller";
// import { Role } from "../../types/roles";
import { requireMerchant } from "../../middlewares/requireMerchant";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireMerchant,
  listCreatorPayoutsController
);



router.get(
  "/summary",
  requireAuth,
  requireMerchant,
  getPayoutSummaryController
);




export default router;