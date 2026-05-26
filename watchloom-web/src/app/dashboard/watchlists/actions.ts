"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createWatchlist,
  deleteWatchlist,
  updateWatchlist,
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
