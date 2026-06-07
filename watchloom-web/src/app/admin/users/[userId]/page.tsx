import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteAdminUserAction,
  updateAdminUserActiveAction,
  updateAdminUserRoleAction,
} from "@/actions/admin-user.actions";
import { AdminUserActiveButton } from "@/components/admin/AdminUserActiveButton";
import { DeleteAdminUserButton } from "@/components/admin/DeleteAdminUserButton";
import { getAdminUserById } from "@/services/admin-user.service";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const parseUserId = (value: string) => {
  const userId = Number(value);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  return userId;
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: AdminUserDetailPageProps) {
  const { userId: userIdValue } = await params;
  const userId = parseUserId(userIdValue);
  const [user, messages] = await Promise.all([getAdminUserById(userId), searchParams]);

  if (!user) {
    notFound();
  }

  const updateRoleAction = updateAdminUserRoleAction.bind(null, String(user.id));
  const activateAction = updateAdminUserActiveAction.bind(null, String(user.id));
  const deleteAction = deleteAdminUserAction.bind(null, String(user.id));

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="watchloom-back-link"
        >
          Back to users
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{user.username}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage role and active status. Sensitive auth data is not exposed.
        </p>
      </div>

      {messages.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {messages.error}
        </p>
      ) : null}
      {messages.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {messages.success}
        </p>
      ) : null}

      <dl className="watchloom-surface rounded-3xl p-5">
        {[
          ["ID", String(user.id)],
          ["Username", user.username],
          ["Email", user.email],
          ["Role", user.role],
          ["Active", user.isActive ? "Yes" : "No"],
          ["Created", formatDate(user.createdAt)],
          ["Watchlists", String(user.watchlistsCount)],
          ["Reviews", String(user.reviewsCount)],
          ["Favourites", String(user.favouritesCount)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-b border-zinc-200 py-3 last:border-b-0 dark:border-zinc-800 sm:flex-row sm:justify-between"
          >
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="text-sm text-zinc-950 dark:text-zinc-50">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="grid gap-5 lg:grid-cols-2">
        <form
          action={updateRoleAction}
          className="watchloom-surface rounded-3xl p-5"
        >
          <h3 className="text-lg font-semibold tracking-tight">Change role</h3>
          <label className="mt-4 block text-sm font-medium">
            Role
            <select
              name="role"
              defaultValue={user.role}
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Save role
          </button>
        </form>

        <div className="watchloom-surface rounded-3xl p-5">
          <h3 className="text-lg font-semibold tracking-tight">Account actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <AdminUserActiveButton action={activateAction} isActive={user.isActive} />
            <DeleteAdminUserButton action={deleteAction} />
          </div>
        </div>
      </section>
    </section>
  );
}
