import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signAccessToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

type UserRole = "user" | "editor" | "admin";

type UserRecord = typeof users.$inferSelect;

export type SafeUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type RegisterUserInput = {
  email: string;
  password: string;
  username?: string;
  name?: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  user: SafeUser;
  accessToken: string;
};

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "EMAIL_IN_USE" | "INVALID_CREDENTIALS" | "INVALID_INPUT",
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeUserRole = (role: string): UserRole => {
  if (role === "editor" || role === "admin") {
    return role;
  }

  return "user";
};

const toSafeUser = (user: UserRecord): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: normalizeUserRole(user.role),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getUserRecordByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user ?? null;
};

const isUniqueConstraintError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
};

export const getUserByEmail = async (email: string) => {
  const user = await getUserRecordByEmail(email);

  return user ? toSafeUser(user) : null;
};

export const registerUser = async (input: RegisterUserInput) => {
  const email = normalizeEmail(input.email);
  const name = (input.username ?? input.name)?.trim();

  if (!email || !name || !input.password) {
    throw new AuthServiceError("Invalid registration input.", "INVALID_INPUT");
  }

  const existingUser = await getUserRecordByEmail(email);

  if (existingUser) {
    throw new AuthServiceError("Email is already registered.", "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const [createdUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "user",
      })
      .returning();

    return toSafeUser(createdUser);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AuthServiceError("Email is already registered.", "EMAIL_IN_USE");
    }

    throw error;
  }
};

export const loginUser = async (input: LoginUserInput): Promise<LoginResult> => {
  const user = await getUserRecordByEmail(input.email);
  const invalidCredentialsError = new AuthServiceError(
    "Invalid email or password.",
    "INVALID_CREDENTIALS",
  );

  if (!user) {
    throw invalidCredentialsError;
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }

  const safeUser = toSafeUser(user);
  const accessToken = signAccessToken({
    sub: String(safeUser.id),
    userId: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });

  return {
    user: safeUser,
    accessToken,
  };
};
