import { successResponse } from "../../shared/response";

export function getMe(req: any, res: any) {
  res.json(
    successResponse({
      id: req.user.id,
      email: "test@example.com",
      role: req.user.role,
    }),
  );
}
