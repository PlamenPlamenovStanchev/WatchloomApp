import type { SafeUser } from "@/services/auth.service";

type AdminHeaderProps = {
  user: SafeUser;
};

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Admin area
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.username}.</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Monitor users, messages, and catalog health from one place.
          </p>
        </div>
        <p className="inline-flex w-fit rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {user.role}
        </p>
      </div>
    </header>
  );
}
