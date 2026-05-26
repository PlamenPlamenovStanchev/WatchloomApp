type WatchlistFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name?: string;
    description?: string | null;
  };
  error?: string;
};

export function WatchlistForm({
  action,
  submitLabel,
  defaultValues,
  error,
}: WatchlistFormProps) {
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

      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        minLength={1}
        maxLength={120}
        defaultValue={defaultValues?.name ?? ""}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
      />

      <label
        className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        htmlFor="description"
      >
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={5}
        defaultValue={defaultValues?.description ?? ""}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
      />

      <div className="mt-5 flex justify-end">
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
