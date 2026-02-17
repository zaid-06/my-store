import { Router } from "express";
import { Role } from "../../types/roles";
import { requireAuth, requireRole } from "../auth/auth.middleware";

import {
    
createProductController
} from "./product.controller";


export const productRoutes = Router();








productRoutes.post(
  "/",
  requireAuth,
  requireRole(Role.CREATOR),
  createProductController
);




