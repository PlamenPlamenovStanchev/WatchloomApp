"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createReview,
  deleteReview,
  ReviewServiceError,
  updateReview,
} from "@/services/review.service";

type MediaType = "movie" | "series";

const getUser = async (next: string) => {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
};

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

const getReviewInput = (formData: FormData) => {
  const rating = Number(getString(formData, "rating"));

  return {
    rating,
    title: getString(formData, "title"),
    content: getString(formData, "content"),
    isPublic: formData.get("isPublic") === "on",
  };
};

const redirectWith = (path: string, key: string, message: string) => {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
};

export async function createReviewAction(
  mediaType: MediaType,
  mediaId: number,
  path: string,
  formData: FormData,
) {
  const user = await getUser(path);

  try {
    await createReview(user.id, mediaType, mediaId, getReviewInput(formData));
    revalidatePath(path);
    revalidatePath("/dashboard/reviews");
  } catch (error) {
    if (error instanceof ReviewServiceError) {
      redirectWith(path, "reviewError", error.message);
    }
    throw error;
  }

  redirectWith(path, "reviewSuccess", "Review saved.");
}

export async function updateReviewAction(reviewId: number, path: string, formData: FormData) {
  const user = await getUser(path);

  try {
    const review = await updateReview(user.id, reviewId, getReviewInput(formData));
    if (!review) notFound();
    revalidatePath(path);
    revalidatePath("/dashboard/reviews");
  } catch (error) {
    if (error instanceof ReviewServiceError) {
      redirectWith(path, "reviewError", error.message);
    }
    throw error;
  }

  redirectWith(path, "reviewSuccess", "Review updated.");
}

export async function deleteReviewAction(reviewId: number, path = "/dashboard/reviews") {
  const user = await getUser(path);
  const deleted = await deleteReview(user.id, reviewId);

  if (!deleted) notFound();

  revalidatePath(path);
  revalidatePath("/dashboard/reviews");
}
