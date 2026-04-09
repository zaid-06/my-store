import { successResponse } from "../../shared/response";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.config";
import { ApiError } from "../../shared/api-error";

export const getMe = async (req: any, res: any) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const user = session.user;

  return res.json(
    successResponse({
      id: user.id,
      email: user.email,
    })
  );
};