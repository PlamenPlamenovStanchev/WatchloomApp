import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  value?: string;
  tone?: "default" | "admin" | "editor";
};

const rolePanelClasses = {
  admin:
    "border border-purple-300/80 bg-gradient-to-br from-purple-700 via-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-purple-900/25 hover:border-purple-200 dark:border-purple-400/40",
  editor:
    "border border-cyan-300/80 bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500 text-white shadow-2xl shadow-cyan-900/25 hover:border-cyan-200 dark:border-cyan-400/40",
};

export function DashboardCard({
  href,
  title,
  description,
  label,
  value,
  tone = "default",
}: DashboardCardProps) {
  const isRolePanel = tone !== "default";
  const panelClass = isRolePanel
    ? rolePanelClasses[tone]
    : "watchloom-surface hover:border-orange-200 dark:hover:border-orange-900/60";

  const content = (
    <>
      <div
        className={`mb-4 flex size-10 items-center justify-center rounded-2xl text-sm font-semibold transition group-hover:rotate-3 group-hover:scale-105 ${
          isRolePanel
            ? "bg-white/20 text-white shadow-lg shadow-black/10"
            : "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
        }`}
      >
        {title.slice(0, 1)}
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p
        className={`mt-2 min-h-12 text-sm leading-6 ${
          isRolePanel ? "text-white/90" : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {description}
      </p>
      {value ? (
        <p
          className={`mt-5 text-sm font-medium ${
            isRolePanel ? "text-white" : "text-zinc-950 dark:text-zinc-50"
          }`}
        >
          {value}
        </p>
      ) : null}
      {label ? (
        <p
          className={`mt-5 text-sm font-semibold transition group-hover:translate-x-1 ${
            isRolePanel ? "text-white" : "text-orange-700 dark:text-orange-300"
          }`}
        >
          {label} →
        </p>
      ) : null}
    </>
  );

  if (!href) {
    return <div className={`${panelClass} rounded-3xl p-5`}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={`group rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/15 ${panelClass}`}
    >
      {content}
    </Link>
  );
}
