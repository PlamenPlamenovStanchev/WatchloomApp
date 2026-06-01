import { errorResponse, successResponse } from "@/lib/api/response";
import { getUserReviews } from "@/services/review.service";

import { getAuthenticatedUserId, reviewErrorResponse } from "../_utils";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    return successResponse(await getUserReviews(userId));
  } catch (error) {
    return reviewErrorResponse(error);
  }
}
