import type { SafeUser } from "@/services/auth.service";

type EditorHeaderProps = {
  user: SafeUser;
};

export function EditorHeader({ user }: EditorHeaderProps) {
  return (
    <header className="watchloom-surface rounded-3xl p-5">
      <p className="watchloom-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
        Editor area
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="watchloom-gradient-text mt-3 text-3xl font-semibold tracking-tight">
            Welcome, {user.username}.
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Manage catalog content drafts and review editorial queues.
          </p>
        </div>
        <p className="inline-flex w-fit rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 px-3 py-1 text-xs font-semibold capitalize text-white shadow-lg shadow-cyan-900/20">
          {user.role}
        </p>
      </div>
    </header>
  );
}
