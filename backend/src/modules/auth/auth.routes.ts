import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.config";

const router = Router();

/**
 * Health check
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: "Auth module is healthy",
    error: null,
  });
});

/**
 * BetterAuth handler (must be LAST)
 */
router.all("/{*any}", toNodeHandler(auth));

export default router;
