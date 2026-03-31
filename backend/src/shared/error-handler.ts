// import { ApiError } from "./api-error";
// import { logger } from "./logger";
// export function errorHandler(err: any, req: any, res: any, next: any) {
//   if (err instanceof ApiError) {
//     return res.status(err.statusCode).json({
//       success: false,
//       data: null,
//       error: { message: err.message },
//     });
//   }

//   logger.error("[errorHandler]", err);
//   return res.status(500).json({
//     success: false,
//     data: null,
//     error: {message: "Internal server error"}
//   });
// }

import { ApiError } from "./api-error";
import { logger } from "./logger";
import { ZodError } from "zod";

export function errorHandler(err: any, _req: any, res: any, _next: any) {
  // ✅ Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        message: err.issues[0]?.message || "Validation error",
      },
    });
  }

  // ✅ Custom API error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: {
        message: err.message,
      },
    });
  }

  // ✅ Log unexpected errors
  logger.error("[errorHandler]", err);

  // ✅ Fallback (safe message)
  return res.status(500).json({
    success: false,
    data: null,
    error: {
      message: err?.message || "Internal server error",
    },
  });
}
