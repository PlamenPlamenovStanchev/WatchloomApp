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
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
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
              className="mt-2 block w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-950 dark:hover:file:bg-zinc-200"
            />
          </label>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
            >
              Upload poster
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
