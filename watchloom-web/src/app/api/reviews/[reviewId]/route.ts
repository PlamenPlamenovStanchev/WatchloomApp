import { errorResponse, successResponse } from "@/lib/api/response";
import { deleteReview, updateReview } from "@/services/review.service";

import {
  getAuthenticatedUserId,
  parsePositiveId,
  parseReviewInput,
  readJsonObject,
  reviewErrorResponse,
} from "../_utils";

type ReviewRouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function PATCH(request: Request, { params }: ReviewRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const reviewId = parsePositiveId((await params).reviewId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!reviewId) {
    return errorResponse("Review not found.", 404);
  }

  try {
    const review = await updateReview(userId, reviewId, parseReviewInput(await readJsonObject(request)));

    return review ? successResponse(review) : errorResponse("Review not found.", 404);
  } catch (error) {
    return reviewErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: ReviewRouteContext) {
  const userId = await getAuthenticatedUserId(request);
  const reviewId = parsePositiveId((await params).reviewId);

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  if (!reviewId) {
    return errorResponse("Review not found.", 404);
  }

  try {
    return (await deleteReview(userId, reviewId))
      ? successResponse(true)
      : errorResponse("Review not found.", 404);
  } catch (error) {
    return reviewErrorResponse(error);
  }
}
