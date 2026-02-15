import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { storeRoutes } from "./modules/stores/store.routes";
import adminRoutes from "./modules/admin/admin.routes";

export const app = express();

// ✅ CORS must come first
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // required for cookies
  })
);

// ✅ Body parser
app.use(express.json());

// ✅ Cookie parser (REQUIRED for Better Auth)
app.use(cookieParser());

// ✅ Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/stores", storeRoutes);
app.use("/v1/api/admin", adminRoutes);

// ✅ Error handler MUST be last
app.use(errorHandler);
