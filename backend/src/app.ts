import express from "express";
import cors from "cors";
import { errorHandler } from "./shared/error-handler";
// import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
// import userRoutes from "./modules/users/user.routes";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/users", userRoutes);

app.use(errorHandler);

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// import { errorHandler } from "./shared/error-handler";
// import authRoutes from "./modules/auth/auth.routes";
// import { userRoutes } from "./modules/users/user.routes";

// export const app = express();

// /**
//  * CORS (must allow credentials)
//  */
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   }),
// );

// /**
//  * Cookies (🔥 REQUIRED for BetterAuth)
//  */
// app.use(cookieParser());

// /**
//  * Body parser
//  */
// app.use(express.json());

// /**
//  * Routes
//  */
// app.use("/v1/api/auth", authRoutes);
// app.use("/v1/api/users", userRoutes);

// /**
//  * Global error handler (last)
//  */
// app.use(errorHandler);
