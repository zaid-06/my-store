import { Request, Response, NextFunction } from "express";

type RateLimitEntry = {
  count: number;
  startTime: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

const LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {  
  const ip = req.ip || "unknown";

  const now = Date.now();

  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  // reset window
  if (now - entry.startTime > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return next();
  }

  // increment count
  entry.count++;

  if (entry.count > LIMIT) {
    return res.status(429).json({
      error: "Too many requests. Try again later.",
    });
  }

  rateLimitMap.set(ip, entry);

  next();
};