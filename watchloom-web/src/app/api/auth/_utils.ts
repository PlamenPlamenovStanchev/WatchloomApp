import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiError } from "@/lib/api";
import type { LoginInput, RegisterInput } from "@/services/auth.service";
import { AuthServiceError } from "@/services/auth.service";

export const AUTH_COOKIE_NAME = "watchloom_access_token";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const readJsonObject = async (request: Request): Promise<JsonObject> => {
  try {
    const body = (await request.json()) as unknown;

    if (!isJsonObject(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    return body;
  } catch {
    throw new AuthServiceError("Request body must be valid JSON.", "INVALID_INPUT");
  }
};

const getTrimmedStringField = (body: JsonObject, field: string) => {
  const value = body[field];

  return typeof value === "string" ? value.trim() : "";
};

const getStringField = (body: JsonObject, field: string) => {
  const value = body[field];

  return typeof value === "string" ? value : "";
};

export const parseRegisterInput = (body: JsonObject): RegisterInput => {
  const email = getTrimmedStringField(body, "email").toLowerCase();
  const username = getTrimmedStringField(body, "username");
  const password = getStringField(body, "password");

  if (!EMAIL_PATTERN.test(email)) {
    throw new AuthServiceError("A valid email is required.", "INVALID_INPUT");
  }

  if (!username) {
    throw new AuthServiceError("Username is required.", "INVALID_INPUT");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthServiceError("Password must be at least 8 characters.", "INVALID_INPUT");
  }

  return {
    email,
    username,
    password,
  };
};

export const parseLoginInput = (body: JsonObject): LoginInput => {
  const email = getTrimmedStringField(body, "email").toLowerCase();
  const password = getStringField(body, "password");

  if (!EMAIL_PATTERN.test(email) || !password) {
    throw new AuthServiceError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  return {
    email,
    password,
  };
};

export const authErrorResponse = (error: unknown) => {
  if (error instanceof AuthServiceError) {
    if (error.code === "EMAIL_IN_USE") {
      return apiError(error.message, { status: 409 });
    }

    if (error.code === "INVALID_CREDENTIALS") {
      return apiError("Invalid email or password", { status: 401 });
    }

    return apiError(error.message, { status: 400 });
  }

  return apiError("Internal server error.");
};

export const setAuthCookie = (response: NextResponse, accessToken: string) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
};

export const clearAuthCookie = (response: NextResponse) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token, ...extraParts] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || extraParts.length > 0) {
    return null;
  }

  return token;
};

export const getCookieToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
};
