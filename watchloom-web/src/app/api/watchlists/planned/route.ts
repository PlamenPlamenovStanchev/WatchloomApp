import { errorResponse, successResponse } from "@/lib/api/response";
import { getPlannedWatchItems } from "@/services/watchlist.service";

import { getAuthenticatedUserId, watchlistErrorResponse } from "../_utils";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    return successResponse(await getPlannedWatchItems(userId));
  } catch (error) {
    return watchlistErrorResponse(error);
  }
}
