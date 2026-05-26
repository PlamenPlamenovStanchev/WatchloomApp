import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminUserById } from "@/services/admin-user.service";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
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

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { userId: userIdValue } = await params;
  const user = await getAdminUserById(parseUserId(userIdValue));

  if (!user) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to users
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{user.username}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Read-only account details. Sensitive auth data is not exposed.
        </p>
      </div>

      <dl className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {[
          ["ID", String(user.id)],
          ["Username", user.username],
          ["Email", user.email],
          ["Role", user.role],
          ["Active", user.isActive ? "Yes" : "No"],
          ["Created", formatDate(user.createdAt)],
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
    </section>
  );
}
