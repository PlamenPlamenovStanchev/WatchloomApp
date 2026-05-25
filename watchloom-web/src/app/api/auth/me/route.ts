import { apiError, apiSuccess } from "@/lib/api";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getSafeUserById } from "@/services/auth.service";

import { getBearerToken, getCookieToken } from "../_utils";

export async function GET(request: Request) {
  const token = getBearerToken(request) ?? (await getCookieToken());

  if (!token) {
    return apiError("Unauthorized", { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await getSafeUserById(payload.userId);

    if (!user || !user.isActive) {
      return apiError("Unauthorized", { status: 401 });
    }

    return apiSuccess({ user });
  } catch {
    return apiError("Unauthorized", { status: 401 });
  }
}
