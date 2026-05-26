"use client";

type PromoteEditorButtonProps = {
  action: () => void | Promise<void>;
};

export function PromoteEditorButton({ action }: PromoteEditorButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Promote this linked user to editor?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Promote to editor
      </button>
    </form>
  );
}
