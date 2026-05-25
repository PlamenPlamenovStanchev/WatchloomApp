import { successResponse } from "@/lib/api/response";

import { clearAuthCookie } from "../_utils";

export async function POST() {
  const response = successResponse({ loggedOut: true });

  clearAuthCookie(response);

  return response;
}
