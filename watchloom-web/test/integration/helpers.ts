import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { signAccessToken } from "@/lib/auth/jwt";
type AuthUser = {
  id: number;
  email: string;
  role: string;
};

type RouteContext = {
  params: Promise<Record<string, string>>;
};

type RouteHandler = (request: Request, context: RouteContext) => Promise<Response> | Response;

export const jsonRequest = (path: string, body?: unknown, init?: RequestInit) => {
  return new Request(`http://localhost${path}`, {
    method: body === undefined ? "GET" : "POST",
    ...init,
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...init?.headers,
    },
    body: body === undefined ? init?.body : JSON.stringify(body),
  });
};

export const callRoute = async (
  handler: unknown,
  path: string,
  options: {
    body?: unknown;
    method?: string;
    params?: Record<string, string>;
    headers?: HeadersInit;
  } = {},
) => {
  const request = jsonRequest(path, options.body, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: options.headers,
  });
  const routeHandler = handler as RouteHandler;
  const response = await routeHandler(request, { params: Promise.resolve(options.params ?? {}) });
  const json = (await response.json()) as unknown;

  return {
    response,
    json,
  };
};

export const expectSuccess = <T = unknown>(json: unknown) => {
  expect(json).toMatchObject({ success: true });

  return (json as { data: T }).data;
};

export const expectFailure = (json: unknown) => {
  expect(json).toMatchObject({ success: false });

  return json as { error: unknown };
};

export const bearerHeaderForUser = async (user: AuthUser) => {
  if (user.role !== "user" && user.role !== "editor" && user.role !== "admin") {
    throw new Error(`Invalid auth role for test token: ${user.role}`);
  }

  const token = await signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    authorization: `Bearer ${token}`,
  };
};

export const authCookieFromResponse = (response: Response) => {
  const cookie = response.headers.get("set-cookie");
  const token = cookie?.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!token) {
    throw new Error("Auth cookie was not set.");
  }

  return `${AUTH_COOKIE_NAME}=${token}`;
};
