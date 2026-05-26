import { cookies } from "next/headers";

import { getSafeUserById } from "@/services/auth.service";

import { AUTH_COOKIE_NAME } from "./cookies";
import { verifyAccessToken } from "./jwt";

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);

    return getSafeUserById(payload.userId);
  } catch {
    return null;
  }
};
