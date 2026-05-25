import { createHmac, timingSafeEqual } from "node:crypto";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24;
const JWT_ALGORITHM = "HS256";
const JWT_TYPE = "JWT";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type UserRole = "user" | "editor" | "admin";

export type AccessTokenPayload = {
  userId: number;
  email: string;
  role: UserRole;
};

export type VerifiedAccessTokenPayload = AccessTokenPayload & {
  exp: number;
  iat: number;
};

type JwtBody = Record<string, JsonValue | undefined>;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set.");
  }

  return secret;
};

const base64UrlEncode = (value: string) => {
  return Buffer.from(value).toString("base64url");
};

const base64UrlDecode = (value: string) => {
  return Buffer.from(value, "base64url").toString("utf8");
};

const sign = (value: string) => {
  return createHmac("sha256", getJwtSecret()).update(value).digest("base64url");
};

const parseJsonSegment = (segment: string) => {
  try {
    return JSON.parse(base64UrlDecode(segment)) as unknown;
  } catch {
    throw new Error("Invalid access token.");
  }
};

const isUserRole = (role: unknown): role is UserRole => {
  return role === "user" || role === "editor" || role === "admin";
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: JWT_ALGORITHM,
    typ: JWT_TYPE,
  };
  const body: JwtBody = {
    ...payload,
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signatureBase = `${encodedHeader}.${encodedBody}`;

  return `${signatureBase}.${sign(signatureBase)}`;
};

export const verifyAccessToken = (token: string): VerifiedAccessTokenPayload => {
  const [encodedHeader, encodedBody, signature, ...extraSegments] = token.split(".");

  if (!encodedHeader || !encodedBody || !signature || extraSegments.length > 0) {
    throw new Error("Invalid access token.");
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedBody}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error("Invalid access token.");
  }

  const header = parseJsonSegment(encodedHeader);

  if (
    typeof header !== "object" ||
    header === null ||
    !("alg" in header) ||
    header.alg !== JWT_ALGORITHM
  ) {
    throw new Error("Invalid access token.");
  }

  const payload = parseJsonSegment(encodedBody);

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid access token.");
  }

  const body = payload as JwtBody;

  if (
    typeof body.exp !== "number" ||
    typeof body.iat !== "number" ||
    typeof body.userId !== "number" ||
    typeof body.email !== "string" ||
    !isUserRole(body.role)
  ) {
    throw new Error("Invalid access token.");
  }

  if (body.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Access token has expired.");
  }

  return {
    userId: body.userId,
    email: body.email,
    role: body.role,
    exp: body.exp,
    iat: body.iat,
  };
};
