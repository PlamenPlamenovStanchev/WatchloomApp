"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  addFavourite,
  FavouriteServiceError,
  removeFavourite,
  removeFavouriteForMedia,
} from "@/services/favourite.service";

type MediaType = "movie" | "series";

const getUser = async (next: string) => {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
};

const redirectWith = (path: string, key: string, message: string) => {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
};

export async function addFavouriteAction(mediaType: MediaType, mediaId: number, path: string) {
  const user = await getUser(path);

  try {
    await addFavourite(user.id, mediaType, mediaId);
    revalidatePath(path);
    revalidatePath("/dashboard/favourites");
  } catch (error) {
    if (error instanceof FavouriteServiceError) {
      redirectWith(path, "favouriteError", error.message);
    }
    throw error;
  }

  redirectWith(path, "favouriteSuccess", "Added to favourites.");
}

export async function removeFavouriteAction(favouriteId: number, path = "/dashboard/favourites") {
  const user = await getUser(path);
  const removed = await removeFavourite(user.id, favouriteId);

  if (!removed) notFound();

  revalidatePath(path);
  revalidatePath("/dashboard/favourites");
}

export async function removeFavouriteForMediaAction(
  mediaType: MediaType,
  mediaId: number,
  path: string,
) {
  const user = await getUser(path);
  await removeFavouriteForMedia(user.id, mediaType, mediaId);

  revalidatePath(path);
  revalidatePath("/dashboard/favourites");
}
