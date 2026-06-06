import type { SafeUser } from "@/services/auth.service";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
  user: SafeUser;
};

export function AdminShell({ children, user }: AdminShellProps) {
  return (
    <main className="min-h-screen text-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <AdminHeader user={user} />
          {children}
        </div>
      </div>
    </main>
  );
}
