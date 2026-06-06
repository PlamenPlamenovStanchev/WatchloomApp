import type { SafeUser } from "@/services/auth.service";

type DashboardHeaderProps = {
  user: SafeUser;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-zinc-200/80 pb-8 dark:border-zinc-800 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="watchloom-pill inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
          Private dashboard
        </p>
        <h1 className="watchloom-gradient-text mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome, {user.username}.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Track what you plan to watch, revisit favourites, and keep your reviews close at hand.
        </p>
      </div>

      <div className="watchloom-surface grid gap-2 rounded-3xl p-4 text-sm sm:min-w-72">
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 dark:text-zinc-400">Username</span>
          <span className="font-medium text-zinc-950 dark:text-zinc-50">{user.username}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 dark:text-zinc-400">Email</span>
          <span className="break-all text-right font-medium text-zinc-950 dark:text-zinc-50">
            {user.email}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 dark:text-zinc-400">Role</span>
          <span className="font-medium capitalize text-zinc-950 dark:text-zinc-50">{user.role}</span>
        </div>
      </div>
    </header>
  );
}
