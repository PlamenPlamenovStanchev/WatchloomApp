type EditorEpisodeFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  error?: string;
  success?: string;
  defaultValues?: {
    episodeNumber?: number;
    title?: string;
    overview?: string | null;
    durationMinutes?: number | null;
    airDate?: string | Date | null;
  };
};

const inputClass =
  "mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

const formatDateInput = (value?: string | Date | null) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
};

export function EditorEpisodeForm({
  action,
  submitLabel,
  error,
  success,
  defaultValues,
}: EditorEpisodeFormProps) {
  return (
    <form
      action={action}
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Episode number
          <input
            name="episodeNumber"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.episodeNumber ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Duration minutes
          <input
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={defaultValues?.durationMinutes ?? ""}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium">
          Air date
          <input
            name="airDate"
            type="date"
            defaultValue={formatDateInput(defaultValues?.airDate)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        Title
        <input
          name="title"
          required
          defaultValue={defaultValues?.title ?? ""}
          className={inputClass}
        />
      </label>

      <label className="mt-4 block text-sm font-medium">
        Description
        <textarea
          name="overview"
          rows={5}
          defaultValue={defaultValues?.overview ?? ""}
          className={inputClass}
        />
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
