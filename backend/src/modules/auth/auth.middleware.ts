  import { Request, Response, NextFunction } from "express";
  import { ApiError } from "../../shared/api-error";
  import { Role } from "../../types/roles";
  import { fromNodeHeaders } from "better-auth/node";
  import { auth } from "../auth/auth.config";
  import { logger } from "../../shared/logger";
 

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    logger.info("requireAuth called");
  
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });


    //  BLOCK HERE
    if (!session?.user?.id) {
      return next(new ApiError("Unauthorized", 401));
    }

    //  only set when valid
    req.user = {
      id: session.user.id,
      role: session.user.role as Role,
      email: session.user.email,
    };
    
      return next();
    } catch (err) {
      return next(err);
    }
  };
  
  //  * Require specific role 
   
  export function requireRole(role: Role) {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (req.user?.role !== role) {
        throw new ApiError("Forbidden", 403);
      }
      next();
    };
  }
