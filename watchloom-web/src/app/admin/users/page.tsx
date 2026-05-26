import Link from "next/link";

import { getAdminUsers } from "@/services/admin-user.service";

type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    role?: string;
    active?: string;
  }>;
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
};

const roleOptions = [
  { value: "", label: "All roles" },
  { value: "user", label: "Users" },
  { value: "editor", label: "Editors" },
  { value: "admin", label: "Admins" },
];

const activeOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const users = await getAdminUsers({
    page: params.page,
    search: params.q,
    role: params.role,
    active: params.active,
  });
  const currentPage = users.page;
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(users.totalPages, currentPage + 1);
  const query = new URLSearchParams();

  if (users.search) query.set("q", users.search);
  if (users.role) query.set("role", users.role);
  if (users.active) query.set("active", users.active);

  const queryPrefix = query.toString();
  const getPageHref = (page: number) =>
    `/admin/users?page=${page}${queryPrefix ? `&${queryPrefix}` : ""}`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Review user accounts. Role changes and deactivation are not implemented yet.
        </p>
      </div>

      <form action="/admin/users" className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-[1fr_170px_170px_auto]">
        <input
          name="q"
          defaultValue={users.search}
          placeholder="Search email or username"
          className="min-w-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
        />
        <select
          name="role"
          defaultValue={users.role}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="active"
          defaultValue={users.active}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-black"
        >
          {activeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Filter
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {users.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {users.items.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium">{user.id}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <span className="capitalize">{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {user.isActive ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="flex items-center justify-between gap-4" aria-label="User pagination">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Page {users.page} of {users.totalPages}
        </p>
        <div className="flex gap-2">
          <Link
            href={getPageHref(previousPage)}
            aria-disabled={currentPage <= 1}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Previous
          </Link>
          <Link
            href={getPageHref(nextPage)}
            aria-disabled={currentPage >= users.totalPages}
            className={`rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium dark:border-zinc-800 ${
              currentPage >= users.totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            Next
          </Link>
        </div>
      </nav>
    </div>
  );
}
