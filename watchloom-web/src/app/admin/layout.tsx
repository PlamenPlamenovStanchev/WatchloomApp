import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
