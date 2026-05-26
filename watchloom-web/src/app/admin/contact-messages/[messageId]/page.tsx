import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteAdminMessageAction,
  promoteMessageUserToEditorAction,
  updateAdminMessageStatusAction,
} from "@/actions/admin-message.actions";
import { DeleteAdminMessageButton } from "@/components/admin/DeleteAdminMessageButton";
import { PromoteEditorButton } from "@/components/admin/PromoteEditorButton";
import {
  getAdminContactMessageById,
  isEditorRequest,
} from "@/services/admin-message.service";

type AdminContactMessageDetailPageProps = {
  params: Promise<{
    messageId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const parseMessageId = (value: string) => {
  const messageId = Number(value);

  if (!Number.isInteger(messageId) || messageId <= 0) {
    notFound();
  }

  return messageId;
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

export default async function AdminContactMessageDetailPage({
  params,
  searchParams,
}: AdminContactMessageDetailPageProps) {
  const { messageId: messageIdValue } = await params;
  const messageId = parseMessageId(messageIdValue);
  const [message, messages] = await Promise.all([
    getAdminContactMessageById(messageId),
    searchParams,
  ]);

  if (!message) {
    notFound();
  }

  const markReadAction = updateAdminMessageStatusAction.bind(null, String(message.id), "read");
  const markResolvedAction = updateAdminMessageStatusAction.bind(
    null,
    String(message.id),
    "resolved",
  );
  const deleteAction = deleteAdminMessageAction.bind(null, String(message.id));
  const promoteAction = promoteMessageUserToEditorAction.bind(null, String(message.id));
  const canPromote =
    isEditorRequest(message) && message.linkedUser && message.linkedUser.role !== "editor";

  return (
    <section className="space-y-5">
      <div>
        <Link
          href="/admin/contact-messages"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to messages
        </Link>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">{message.subject}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          From {message.name} on {formatDate(message.createdAt)}
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

      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
            <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">{message.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="mt-1 text-sm capitalize text-zinc-950 dark:text-zinc-50">
              {message.status}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Linked user</dt>
            <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">
              {message.linkedUser ? (
                <Link href={`/admin/users/${message.linkedUser.id}`} className="hover:underline">
                  {message.linkedUser.username} ({message.linkedUser.role})
                </Link>
              ) : (
                "None"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</dt>
            <dd className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">
              {formatDate(message.createdAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Message</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-800 dark:text-zinc-200">
            {message.message}
          </p>
        </div>
      </article>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-lg font-semibold tracking-tight">Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={markReadAction}>
            <button
              type="submit"
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Mark as read
            </button>
          </form>
          <form action={markResolvedAction}>
            <button
              type="submit"
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              Mark as resolved
            </button>
          </form>
          {canPromote ? <PromoteEditorButton action={promoteAction} /> : null}
          <DeleteAdminMessageButton action={deleteAction} />
        </div>
      </section>
    </section>
  );
}
