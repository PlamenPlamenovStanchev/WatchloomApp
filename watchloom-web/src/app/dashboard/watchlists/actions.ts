"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createWatchlist,
  deleteWatchlist,
  getWatchlistById,
  removeWatchlistItem,
  updateWatchlist,
  updateWatchlistItem,
  WatchlistServiceError,
} from "@/services/watchlist.service";

const getAuthenticatedUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/watchlists");
  }

  return user;
};

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const parseWatchlistId = (value: string) => {
  const watchlistId = Number(value);

  if (!Number.isInteger(watchlistId) || watchlistId <= 0) {
    notFound();
  }

  return watchlistId;
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

const assertOwnedItemInWatchlist = async (
  userId: number,
  watchlistId: number,
  watchlistItemId: number,
) => {
  const watchlist = await getWatchlistById(userId, watchlistId);

  if (!watchlist || !watchlist.items.some((item) => item.id === watchlistItemId)) {
    notFound();
  }
};

export async function createWatchlistAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const name = getStringValue(formData, "name");
  const description = getStringValue(formData, "description");

  try {
    const watchlist = await createWatchlist(user.id, { name, description });

    revalidatePath("/dashboard/watchlists");
    redirect(`/dashboard/watchlists/${watchlist.id}`);
  } catch (error) {
    if (error instanceof WatchlistServiceError) {
      redirect(`/dashboard/watchlists/new?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }
}

export async function updateWatchlistAction(watchlistIdValue: string, formData: FormData) {
  const user = await getAuthenticatedUser();
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const name = getStringValue(formData, "name");
  const description = getStringValue(formData, "description");

  try {
    const watchlist = await updateWatchlist(user.id, watchlistId, { name, description });

    if (!watchlist) {
      notFound();
    }

    revalidatePath("/dashboard/watchlists");
    revalidatePath(`/dashboard/watchlists/${watchlistId}`);
    redirect(`/dashboard/watchlists/${watchlistId}`);
  } catch (error) {
    if (error instanceof WatchlistServiceError) {
      redirect(
        `/dashboard/watchlists/${watchlistId}/edit?error=${encodeURIComponent(error.message)}`,
      );
    }

    throw error;
  }
}

export async function deleteWatchlistAction(watchlistIdValue: string) {
  const user = await getAuthenticatedUser();
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const deleted = await deleteWatchlist(user.id, watchlistId);

  if (!deleted) {
    notFound();
  }

  revalidatePath("/dashboard/watchlists");
  redirect("/dashboard/watchlists");
}

export async function updateWatchlistItemAction(
  watchlistIdValue: string,
  watchlistItemIdValue: string,
  formData: FormData,
) {
  const user = await getAuthenticatedUser();
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const watchlistItemId = parseWatchlistId(watchlistItemIdValue);
  const status = getStringValue(formData, "status");
  const rating = parseOptionalRating(getStringValue(formData, "rating"));
  const notes = getStringValue(formData, "notes");
  const plannedWatchAtValue = getStringValue(formData, "plannedWatchAt");
  const plannedWatchAt = plannedWatchAtValue ? plannedWatchAtValue : null;
  const validStatus =
    status === "watched" || status === "watching" || status === "to_watch" ? status : undefined;

  await assertOwnedItemInWatchlist(user.id, watchlistId, watchlistItemId);

  try {
    const item = await updateWatchlistItem(user.id, watchlistItemId, {
      status: validStatus,
      rating,
      notes,
      plannedWatchAt: validStatus && validStatus !== "to_watch" ? null : plannedWatchAt,
    });

    if (!item || item.watchlistId !== watchlistId) {
      notFound();
    }

    revalidatePath(`/dashboard/watchlists/${watchlistId}`);
    revalidatePath("/dashboard/planned");

    return {
      status: item.status,
      rating: item.rating,
      plannedWatchAt: item.plannedWatchAt,
      notes: item.notes,
    };
  } catch (error) {
    if (error instanceof WatchlistServiceError) {
      redirect(
        `/dashboard/watchlists/${watchlistId}?error=${encodeURIComponent(error.message)}`,
      );
    }

    throw error;
  }
}

export async function removeWatchlistItemAction(
  watchlistIdValue: string,
  watchlistItemIdValue: string,
) {
  const user = await getAuthenticatedUser();
  const watchlistId = parseWatchlistId(watchlistIdValue);
  const watchlistItemId = parseWatchlistId(watchlistItemIdValue);

  await assertOwnedItemInWatchlist(user.id, watchlistId, watchlistItemId);

  const removed = await removeWatchlistItem(user.id, watchlistItemId);

  if (!removed) {
    notFound();
  }

  revalidatePath(`/dashboard/watchlists/${watchlistId}`);
  revalidatePath("/dashboard/planned");
}
