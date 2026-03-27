import { Request, Response } from "express";
import { db } from "../config/db";

export const healthController = async (req: Request, res: Response) => {
  try {
    //  DB check
    await db.execute("SELECT 1");

    return res.json({
      status: "ok",
      db: "connected",
      jobs: "running",
      version: "v1",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      db: "disconnected",
      jobs: "unknown",
      version: "v1",
    });
  }
};