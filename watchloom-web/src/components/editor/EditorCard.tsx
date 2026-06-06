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
      <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-cyan-100 text-sm font-semibold text-cyan-800 transition group-hover:rotate-3 group-hover:scale-105 dark:bg-cyan-950/40 dark:text-cyan-200">
        {title.slice(0, 1)}
      </div>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {value !== undefined ? (
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
      {label ? (
        <p className="mt-5 text-sm font-semibold text-cyan-700 transition group-hover:translate-x-1 dark:text-cyan-300">
          {label} →
        </p>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className="watchloom-surface rounded-3xl p-5">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="watchloom-surface group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/15 dark:hover:border-cyan-900/60"
    >
      {content}
    </Link>
  );
}
