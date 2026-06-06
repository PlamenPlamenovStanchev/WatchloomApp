type PosterUploadFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  posterUrl?: string | null;
  mediaTitle: string;
  error?: string;
  success?: string;
};

export function PosterUploadForm({
  action,
  posterUrl,
  mediaTitle,
  error,
  success,
}: PosterUploadFormProps) {
  return (
    <form
      action={action}
      className="watchloom-surface rounded-3xl p-5"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {posterUrl ? (
            <div
              aria-label={`Current poster for ${mediaTitle}`}
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${posterUrl})` }}
            />
          ) : (
            <div className="flex size-full items-center justify-center px-3 text-center text-xs text-zinc-500">
              No poster
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight">Poster upload</h3>
          {error ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              {success}
            </p>
          ) : null}

          <label className="mt-4 block text-sm font-medium">
            Poster file
            <input
              name="posterFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="mt-2 block w-full text-sm text-zinc-700 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-cyan-600 file:to-teal-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-105 dark:text-zinc-300"
            />
          </label>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/20"
            >
              Upload poster
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
