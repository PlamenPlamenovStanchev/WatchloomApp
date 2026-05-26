import Link from "next/link";

type EditorCardProps = {
  title: string;
  description: string;
  href?: string;
  value?: number | string;
  label?: string;
};

export function EditorCard({ title, description, href, value, label }: EditorCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {value !== undefined ? (
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
      {label ? <p className="mt-5 text-sm font-medium">{label}</p> : null}
    </>
  );

  if (!href) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:focus:ring-zinc-100"
    >
      {content}
    </Link>
  );
}
