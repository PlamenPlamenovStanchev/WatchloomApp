import type { SafeUser } from "@/services/auth.service";

import { EditorHeader } from "./EditorHeader";
import { EditorSidebar } from "./EditorSidebar";

type EditorShellProps = {
  children: React.ReactNode;
  user: SafeUser;
};

export function EditorShell({ children, user }: EditorShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <EditorSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <EditorHeader user={user} />
          {children}
        </div>
      </div>
    </main>
  );
}
