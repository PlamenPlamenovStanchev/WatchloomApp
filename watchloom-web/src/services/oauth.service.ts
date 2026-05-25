import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, oauthAccounts } from "@/db/schema";
import { signAccessToken } from "@/lib/auth/jwt";

type UserRole = "user" | "editor" | "admin";

const normalizeUserRole = (role: string): UserRole => {
  if (role === "editor" || role === "admin") {
    return role;
  }
  return "user";
};

export async function handleGoogleSSO(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}) {
  const email = profile.email.trim().toLowerCase();

  return await db.transaction(async (tx) => {
    // 1. Check if OAuth account exists
    const [existingOauth] = await tx
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, "google"),
          eq(oauthAccounts.providerAccountId, profile.sub)
        )
      )
      .limit(1);

    let userRecord;

    if (existingOauth) {
      // Load user
      const [linkedUser] = await tx
        .select()
        .from(users)
        .where(eq(users.id, existingOauth.userId))
        .limit(1);
        
      if (!linkedUser) {
        throw new Error("Linked user not found");
      }
      userRecord = linkedUser;
    } else {
      // 2. Check if user exists by email
      const [existingUser] = await tx
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        userRecord = existingUser;
      } else {
        // 3. Create new user
        const [createdUser] = await tx
          .insert(users)
          .values({
            name: profile.name,
            email: email,
            role: "user",
          })
          .returning();
        
        userRecord = createdUser;
      }

      // Link OAuth account
      await tx.insert(oauthAccounts).values({
        userId: userRecord.id,
        provider: "google",
        providerAccountId: profile.sub,
        providerEmail: email,
      });
    }

    const safeRole = normalizeUserRole(userRecord.role);

    const accessToken = await signAccessToken({
      userId: userRecord.id,
      email: userRecord.email,
      role: safeRole,
    });

    return {
      accessToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.name,
        role: safeRole,
      }
    };
  });
}
