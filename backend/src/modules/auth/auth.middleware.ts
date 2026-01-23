import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/api-error";
import { Role } from "../../types/roles";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // Placeholder user (real auth comes later)
  req.user = {
    id: "temp-user-id",
    role: Role.ADMIN,
  };

  next();
}

/**
 * Require specific role
 */
export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      throw new ApiError("Forbidden", 403);
    }
    next();
  };
}
