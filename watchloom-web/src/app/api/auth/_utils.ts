import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api/response";
import { AuthServiceError } from "@/services/auth.service";

export const AUTH_COOKIE_NAME = "watchloom_access_token";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;

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

export const authErrorResponse = (error: unknown) => {
  if (error instanceof AuthServiceError) {
    if (error.code === "EMAIL_IN_USE") {
      return errorResponse(error.message, 409);
    }

    if (error.code === "INVALID_CREDENTIALS") {
      return errorResponse("Invalid email or password", 401);
    }

    return errorResponse(error.message, 400);
  }

  return errorResponse("Internal server error.");
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
