import { apiSuccess } from "@/lib/api";

import { clearAuthCookie } from "../_utils";

export async function POST() {
  const response = apiSuccess({ loggedOut: true });

  clearAuthCookie(response);

  return response;
}
