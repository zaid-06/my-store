import { Router } from "express";
import { getMe } from "./user.controller";
import { requireAuth } from "../auth/auth.middleware";

export const userRoutes = Router();

userRoutes.get("/me", requireAuth, getMe);
