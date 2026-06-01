import { errorResponse, successResponse } from "@/lib/api/response";
import { createReview, getPublicReviewsForMedia } from "@/services/review.service";

import {
  getAuthenticatedUserId,
  parseMediaInput,
  parseMediaQuery,
  parseReviewInput,
  readJsonObject,
  reviewErrorResponse,
} from "./_utils";

export async function GET(request: Request) {
  try {
    const { mediaId, mediaType } = parseMediaQuery(request);

    return successResponse(await getPublicReviewsForMedia(mediaType, mediaId));
  } catch (error) {
    return reviewErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const body = await readJsonObject(request);
    const { mediaId, mediaType } = parseMediaInput(body);

    return successResponse(await createReview(userId, mediaType, mediaId, parseReviewInput(body)), {
      status: 201,
    });
  } catch (error) {
    return reviewErrorResponse(error);
  }
}
