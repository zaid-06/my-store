import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../shared/api-error";
import { Role } from "../../types/roles";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.config";

export const requireAuth = async(req: Request, _res: Response, next: NextFunction) => {
  // Placeholder user (real auth comes later)
  console.log("in requireAuth...")
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  console.log("in session ...", session )
  
  req.user = {
    id: (session?.user.id) as string,
    role: (session?.user.role) as Role,
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
