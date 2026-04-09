import { Request, Response, NextFunction } from "express";
import { ApiError } from "../shared/api-error";
import { findMerchantByUserId } from "../modules/merchants/merchant.db";

export const requireMerchant = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }
  //  check merchant
  const merchant = await findMerchantByUserId(userId);
  if (!merchant) {
    throw new ApiError("Merchant account not found", 403);
  }
  //  attach for reuse (IMPORTANT)
  (req as any).merchant = merchant;
  next();
};