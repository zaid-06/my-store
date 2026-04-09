
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTERAUTH_SECRET: z.string(),
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]),
  // Task 7 ENV variables
  PLATFORM_COMMISSION_PERCENT: z
    .coerce.number()
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100")
    .default(10),
  PAYOUT_HOLD_DAYS: z
    .coerce.number()
    .min(0, "Hold days must be at least 0")
    .default(7),
  ADMIN_EMAIL: z.string().email().default("admin@platform.com"),
});
         
export const env = envSchema.parse(process.env);

