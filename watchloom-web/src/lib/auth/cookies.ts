export const AUTH_COOKIE_NAME = "watchloom_access_token";
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;

export const getAuthCookieOptions = () =>
  ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  }) as const;
