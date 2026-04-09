import { Request, Response, NextFunction } from "express";
import { ApiError } from "../shared/api-error";
import { isAdmin } from "../shared/admin.helper";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const user = req.user;

  user && console.log("User email:,,,,,,,,,,,,,,,,,,,,,", user.email); // Debugging line
  if (!user || !isAdmin(user.email)) {
    throw new ApiError("Admin access required", 403);
  }

  next();
};