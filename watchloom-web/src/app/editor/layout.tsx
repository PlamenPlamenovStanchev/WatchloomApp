import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/editor");
  }

  if (user.role !== "editor" && user.role !== "admin") {
    redirect("/forbidden");
  }

  return <EditorShell user={user}>{children}</EditorShell>;
}
