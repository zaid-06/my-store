import { ApiError } from "./api-error";

export function errorHandler(err: any, req: any, res: any, next: any) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { message: err.message },
    });
  }

  return res.status(500).json({
    success: false,
    data: null,
    error: { message: "Internal server error" },
  });
}
