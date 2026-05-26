import Link from "next/link";
import { redirect } from "next/navigation";

import { removeFavouriteAction } from "@/actions/favourite.actions";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserFavourites } from "@/services/favourite.service";

export default async function DashboardFavouritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/favourites");

  const favourites = await getUserFavourites(user.id);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Favourites</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Movies and series you saved.</p>
      </div>

      {favourites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">No favourites yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((favourite) => {
            const href = favourite.media && favourite.mediaType === "movie" ? `/movies/${favourite.media.slug}` : favourite.media ? `/series/${favourite.media.slug}` : null;
            const action = removeFavouriteAction.bind(null, favourite.id, "/dashboard/favourites");

            return (
              <article key={favourite.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                {href && favourite.media ? <Link href={href} className="text-lg font-semibold hover:underline">{favourite.media.title}</Link> : <h3 className="text-lg font-semibold">Unavailable title</h3>}
                <p className="mt-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">{favourite.mediaType}</p>
                <form action={action} className="mt-4">
                  <button type="submit" className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30">Remove</button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
