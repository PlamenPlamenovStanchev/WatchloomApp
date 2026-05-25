import { cookies } from "next/headers";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getSafeUserById } from "@/services/auth.service";

const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAccessToken(token);

    return getSafeUserById(payload.userId);
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  const userPromise = getCurrentUser();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <DashboardContent userPromise={userPromise} />
      </div>
    </main>
  );
}

async function DashboardContent({
  userPromise,
}: {
  userPromise: ReturnType<typeof getCurrentUser>;
}) {
  const user = await userPromise;

  return (
    <>
      <DashboardHeader user={user} />
      <DashboardNav />
    </>
  );
}
