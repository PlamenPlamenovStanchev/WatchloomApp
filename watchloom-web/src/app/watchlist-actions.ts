"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { addWatchlistItem, WatchlistServiceError } from "@/services/watchlist.service";

type WatchlistStatus = "watched" | "watching" | "to_watch";

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const isWatchlistStatus = (value: string): value is WatchlistStatus => {
  return value === "watched" || value === "watching" || value === "to_watch";
};

const parsePositiveInteger = (value: string) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseOptionalRating = (value: string) => {
  if (!value) {
    return null;
  }

  const rating = Number(value);

  if (!Number.isInteger(rating)) {
    throw new WatchlistServiceError("Rating must be a whole number.", "INVALID_INPUT");
  }

  return rating;
};

const getWatchlistInput = (formData: FormData) => {
  const watchlistId = parsePositiveInteger(getStringValue(formData, "watchlistId"));
  const status = getStringValue(formData, "status");
  const plannedWatchAt = getStringValue(formData, "plannedWatchAt");

  if (!watchlistId) {
    throw new WatchlistServiceError("Select a watchlist.", "INVALID_INPUT");
  }

  if (!isWatchlistStatus(status)) {
    throw new WatchlistServiceError("Select a valid status.", "INVALID_INPUT");
  }

  return {
    watchlistId,
    status,
    plannedWatchAt: status === "to_watch" && plannedWatchAt ? plannedWatchAt : null,
    rating: parseOptionalRating(getStringValue(formData, "rating")),
    notes: getStringValue(formData, "notes"),
  };
};

const redirectWithMessage = (redirectPath: string, key: "watchlistError" | "watchlistSuccess", message: string) => {
  redirect(`${redirectPath}?${key}=${encodeURIComponent(message)}`);
};

export async function addMovieToWatchlist(
  movieId: number,
  redirectPath: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  let watchlistId: number;

  try {
    const input = getWatchlistInput(formData);
    watchlistId = input.watchlistId;

    await addWatchlistItem(user.id, input.watchlistId, {
      mediaType: "movie",
      movieId,
      status: input.status,
      plannedWatchAt: input.plannedWatchAt,
      rating: input.rating,
      notes: input.notes,
    });

    revalidatePath(`/dashboard/watchlists/${input.watchlistId}`);
    revalidatePath("/dashboard/planned");
  } catch (error) {
    if (error instanceof WatchlistServiceError) {
      redirectWithMessage(redirectPath, "watchlistError", error.message);
    }

    throw error;
  }

  redirect(`/dashboard/watchlists/${watchlistId}`);
}

export async function addSeriesToWatchlist(
  seriesId: number,
  redirectPath: string,
  formData: FormData,
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  let watchlistId: number;

  try {
    const input = getWatchlistInput(formData);
    watchlistId = input.watchlistId;

    await addWatchlistItem(user.id, input.watchlistId, {
      mediaType: "series",
      seriesId,
      status: input.status,
      plannedWatchAt: input.plannedWatchAt,
      rating: input.rating,
      notes: input.notes,
    });

    revalidatePath(`/dashboard/watchlists/${input.watchlistId}`);
    revalidatePath("/dashboard/planned");
  } catch (error) {
    if (error instanceof WatchlistServiceError) {
      redirectWithMessage(redirectPath, "watchlistError", error.message);
    }

    throw error;
  }

  redirect(`/dashboard/watchlists/${watchlistId}`);
}
