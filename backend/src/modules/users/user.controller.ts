import { successResponse } from "../../shared/response";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth.config";

export const getMe = async(req: any, res: any) =>{
  console.log("in getMe...")
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  console.log("session:", session)
  const user = session?.user
  res.json(
    successResponse(user),
  );
}
