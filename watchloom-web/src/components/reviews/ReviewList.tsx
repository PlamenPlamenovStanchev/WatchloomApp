import type { PublicReview } from "@/services/review.service";

type ReviewListProps = {
  reviews: PublicReview[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <section className="space-y-4" aria-labelledby="public-reviews-heading">
      <h2 id="public-reviews-heading" className="text-xl font-semibold">Public reviews</h2>
      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-8 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">No public reviews yet.</p>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{review.title || "Untitled review"}</h3>
                <span className="text-sm font-medium">{review.rating}/6</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">By {review.user.username}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{review.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
