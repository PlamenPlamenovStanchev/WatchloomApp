"use client";

type DeleteEditorSeriesButtonProps = {
  action: () => void | Promise<void>;
};

export function DeleteEditorSeriesButton({ action }: DeleteEditorSeriesButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this series and its seasons/episodes? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        Delete
      </button>
    </form>
  );
}
