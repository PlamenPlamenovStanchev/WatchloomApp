import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteReviewAction, updateReviewAction } from "@/actions/review.actions";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserReviews } from "@/services/review.service";

export default async function DashboardReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/reviews");

  const reviews = await getUserReviews(user.id);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Edit or delete reviews you wrote.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">No reviews yet.</p>
      ) : (
        <div className="grid gap-5">
          {reviews.map((review) => {
            const href = review.media && review.mediaType === "movie" ? `/movies/${review.media.slug}` : review.media ? `/series/${review.media.slug}` : "/dashboard/reviews";
            const updateAction = updateReviewAction.bind(null, review.id, "/dashboard/reviews");
            const deleteAction = deleteReviewAction.bind(null, review.id, "/dashboard/reviews");

            return (
              <article key={review.id} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Link href={href} className="font-semibold hover:underline">{review.media?.title ?? "Unavailable title"}</Link>
                  <form action={deleteAction}>
                    <button type="submit" className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30">Delete</button>
                  </form>
                </div>
                <ReviewForm action={updateAction} submitLabel="Update review" defaultValues={review} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
