import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRES_IN_MINUTES = 45;
export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been generated.";

export class PasswordResetServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_TOKEN" | "INVALID_INPUT",
  ) {
    super(message);
    this.name = "PasswordResetServiceError";
  }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateResetToken = () => randomBytes(RESET_TOKEN_BYTES).toString("base64url");

const hashResetToken = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

const getResetUrl = (token: string) => {
  const path = `/reset-password?token=${encodeURIComponent(token)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  return appUrl ? `${appUrl}${path}` : path;
};

const getExpiresAt = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRES_IN_MINUTES);

  return expiresAt;
};

const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user ?? null;
};

export const requestPasswordReset = async (email: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(
        and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)),
      );

    await tx.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: getExpiresAt(),
    });
  });

  const resetUrl = getResetUrl(rawToken);

  // TODO: Send this URL through a configured email provider such as Resend, SendGrid, Mailgun, or SMTP.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Password reset] Reset URL: ${resetUrl}`);
  }

  return {
    message: PASSWORD_RESET_SUCCESS_MESSAGE,
    resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : null,
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const normalizedToken = token.trim();

  if (!normalizedToken || !newPassword) {
    throw new PasswordResetServiceError("Invalid or expired password reset token.", "INVALID_INPUT");
  }

  const tokenHash = hashResetToken(normalizedToken);
  const now = new Date();

  await db.transaction(async (tx) => {
    const [resetToken] = await tx
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      throw new PasswordResetServiceError(
        "Invalid or expired password reset token.",
        "INVALID_TOKEN",
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await tx
      .update(users)
      .set({
        passwordHash,
        updatedAt: now,
      })
      .where(eq(users.id, resetToken.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(
        and(
          eq(passwordResetTokens.userId, resetToken.userId),
          isNull(passwordResetTokens.usedAt),
        ),
      );
  });

  return { success: true };
};
