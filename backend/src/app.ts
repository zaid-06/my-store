import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./shared/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import { storeRoutes } from "./modules/stores/store.routes";
import adminRoutes from "./modules/admin/admin.routes";
import {productRoutes} from "./modules/products/product.routes";
import {orderRoutes} from "./modules/orders/order.routes";

import downloadRoutes from "./modules/downloads/download.routes";
import messageRoutes from "./modules/messages/message.routes";
import  payoutRoutes from "./modules/payouts/payout.routes";
import { healthController } from "./shared/health.controller";
export const app = express();

//  CORS must come first
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // required for cookies
  })
);

//  Body parser
app.use(express.json());

//  Cookie parser (REQUIRED for Better Auth)
app.use(cookieParser());

//  Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/stores", storeRoutes);
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/products", productRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/download", downloadRoutes);
app.use("/v1/api/messages", messageRoutes);
app.use("/v1/api/payouts", payoutRoutes);

app.get("/v1/api/health", healthController);
//  Error handler MUST be last
app.use(errorHandler);
