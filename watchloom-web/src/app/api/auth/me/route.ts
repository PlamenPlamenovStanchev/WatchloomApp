import { errorResponse, successResponse } from "@/lib/api/response";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getSafeUserById } from "@/services/auth.service";

import { getBearerToken, getCookieToken } from "../_utils";

export async function GET(request: Request) {
  const token = getBearerToken(request) ?? (await getCookieToken());

  if (!token) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await getSafeUserById(payload.userId);

    if (!user || !user.isActive) {
      return errorResponse("Unauthorized", 401);
    }

    return successResponse({ user });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
