import { seriesStatusValues } from "@/lib/validations/editor-series";
import type { getGenres } from "@/services/genre.service";

type EditorSeriesFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  genres: Awaited<ReturnType<typeof getGenres>>;
  submitLabel: string;
  error?: string;
  success?: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    overview?: string | null;
    releaseYear?: number | null;
    status?: string | null;
    network?: string | null;
    creator?: string | null;
    cast?: string | null;
    posterUrl?: string | null;
    backdropUrl?: string | null;
    genres?: Array<{ id: number }>;
  };
};

const inputClass =
  "mt-2 w-full rounded-xl border border-zinc-300/80 bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-black/40";

export function EditorSeriesForm({
  action,
  genres,
  submitLabel,
  error,
  success,
  defaultValues,
}: EditorSeriesFormProps) {
  const selectedGenreIds = new Set(defaultValues?.genres?.map((genre) => genre.id) ?? []);

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
          Title
          <input name="title" required defaultValue={defaultValues?.title ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Slug
          <input name="slug" defaultValue={defaultValues?.slug ?? ""} className={inputClass} />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium">
        Description
        <textarea
          name="overview"
          rows={5}
          defaultValue={defaultValues?.overview ?? ""}
          className={inputClass}
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <label className="block text-sm font-medium">
          Status
          <select name="status" required defaultValue={defaultValues?.status ?? "Continuing"} className={inputClass}>
            {seriesStatusValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium lg:col-span-2">
          Network
          <input name="network" defaultValue={defaultValues?.network ?? ""} className={inputClass} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Creator
          <input name="creator" defaultValue={defaultValues?.creator ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Cast
          <input name="cast" defaultValue={defaultValues?.cast ?? ""} className={inputClass} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Poster URL
          <input name="posterUrl" defaultValue={defaultValues?.posterUrl ?? ""} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Backdrop URL
          <input name="backdropUrl" defaultValue={defaultValues?.backdropUrl ?? ""} className={inputClass} />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Genres</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre) => (
            <label key={genre.id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                name="genreIds"
                value={genre.id}
                defaultChecked={selectedGenreIds.has(genre.id)}
                className="size-4"
              />
              {genre.name}
            </label>
          ))}
        </div>
      </fieldset>

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
