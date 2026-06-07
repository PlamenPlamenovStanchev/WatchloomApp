import Link from "next/link";

import { getAdminContactMessages } from "@/services/admin-message.service";

type AdminContactMessagesPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

export default async function AdminContactMessagesPage({
  searchParams,
}: AdminContactMessagesPageProps) {
  const [messages, params] = await Promise.all([getAdminContactMessages(), searchParams]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Contact Messages</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Review contact submissions and editor access requests.
        </p>
      </div>

      {params.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {params.success}
        </p>
      ) : null}

      <section className="watchloom-surface overflow-hidden rounded-3xl">
        {messages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No contact messages found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td className="px-4 py-3 font-medium">{message.name}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{message.email}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {message.subject}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      <span className="capitalize">{message.status}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/contact-messages/${message.id}`}
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
    </div>
  );
}
