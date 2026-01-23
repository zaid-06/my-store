import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTERAUTH_SECRET: z.string(),
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const env = envSchema.parse(process.env);
