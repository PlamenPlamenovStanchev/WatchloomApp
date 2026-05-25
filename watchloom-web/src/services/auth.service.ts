import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signAccessToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

type UserRole = "user" | "editor" | "admin";

type UserRecord = typeof users.$inferSelect;

export type SafeUser = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
};

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult = {
  user: SafeUser;
  accessToken: string;
};

export type RegisterUserInput = RegisterInput;
export type LoginUserInput = LoginInput;
export type LoginResult = AuthResult;

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
  email: user.email,
  username: user.name,
  role: normalizeUserRole(user.role),
  isActive: "isActive" in user && typeof user.isActive === "boolean" ? user.isActive : true,
  createdAt: user.createdAt,
});

const getUserRecordByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user ?? null;
};

const getUserRecordById = async (userId: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

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

export const getSafeUserById = async (userId: number) => {
  const user = await getUserRecordById(userId);

  return user ? toSafeUser(user) : null;
};

export const registerUser = async (input: RegisterInput): Promise<SafeUser> => {
  const email = normalizeEmail(input.email);
  const username = input.username.trim();

  if (!email || !username || !input.password) {
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
        name: username,
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

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await getUserRecordByEmail(input.email);
  const invalidCredentialsError = new AuthServiceError(
    "Invalid email or password",
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

  if (!safeUser.isActive) {
    throw invalidCredentialsError;
  }

  const accessToken = signAccessToken({
    userId: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });

  return {
    user: safeUser,
    accessToken,
  };
};
