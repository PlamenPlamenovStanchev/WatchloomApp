import type { ReviewInput } from "@/services/review.service";

type ReviewFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  defaultValues?: Partial<ReviewInput>;
  error?: string;
  success?: string;
};

export function ReviewForm({
  action,
  submitLabel = "Save review",
  defaultValues,
  error,
  success,
}: ReviewFormProps) {
  return (
    <form
      id="review-form"
      action={action}
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 className="text-xl font-semibold">Your review</h2>
      {error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
      {success ? <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">{success}</p> : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Rating</span>
          <select name="rating" defaultValue={defaultValues?.rating ?? 6} className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-black">
            {[1, 2, 3, 4, 5, 6].map((rating) => (
              <option key={rating} value={rating}>{rating}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input name="title" defaultValue={defaultValues?.title ?? ""} className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-black" />
        </label>
      </div>

      <label className="mt-4 grid gap-1 text-sm">
        <span className="font-medium">Content</span>
        <textarea name="content" required rows={5} defaultValue={defaultValues?.content ?? ""} className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-black" />
      </label>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input name="isPublic" type="checkbox" defaultChecked={defaultValues?.isPublic ?? true} className="size-4" />
        Public review
      </label>

      <button type="submit" className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200">
        {submitLabel}
      </button>
    </form>
  );
}
