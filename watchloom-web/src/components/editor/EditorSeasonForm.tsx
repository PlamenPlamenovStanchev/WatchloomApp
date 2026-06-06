type EditorSeasonFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  success?: string;
  defaultValues?: {
    seasonNumber?: number;
    title?: string | null;
    releaseYear?: number | null;
    posterUrl?: string | null;
  };
};

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-300/80 bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-black/40";

export function EditorSeasonForm({
  action,
  submitLabel,
  error,
  success,
  defaultValues,
}: EditorSeasonFormProps) {
  return (
    <form
      action={action}
      className="watchloom-surface rounded-3xl p-5"
    >
      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Season number
          <input
            name="seasonNumber"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.seasonNumber ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Release year
          <input
            name="releaseYear"
            type="number"
            min={1}
            defaultValue={defaultValues?.releaseYear ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        Title
        <input name="title" defaultValue={defaultValues?.title ?? ""} className={inputClass} />
      </label>

      <label className="mt-4 block text-sm font-medium">
        Poster URL
        <input name="posterUrl" defaultValue={defaultValues?.posterUrl ?? ""} className={inputClass} />
      </label>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
