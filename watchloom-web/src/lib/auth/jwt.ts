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

const textEncoder = new TextEncoder();

const base64UrlEncodeBytes = (bytes: Uint8Array) => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const base64UrlEncode = (value: string) => {
  return base64UrlEncodeBytes(textEncoder.encode(value));
};

const base64UrlDecode = (value: string) => {
  const paddedValue = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const base64 = paddedValue.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const getSigningKey = async () => {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getJwtSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
};

const sign = async (value: string) => {
  const signature = await crypto.subtle.sign("HMAC", await getSigningKey(), textEncoder.encode(value));

  return base64UrlEncodeBytes(new Uint8Array(signature));
};

const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
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

export const signAccessToken = async (payload: AccessTokenPayload): Promise<string> => {
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

  return `${signatureBase}.${await sign(signatureBase)}`;
};

export const verifyAccessToken = async (token: string): Promise<VerifiedAccessTokenPayload> => {
  const [encodedHeader, encodedBody, signature, ...extraSegments] = token.split(".");

  if (!encodedHeader || !encodedBody || !signature || extraSegments.length > 0) {
    throw new Error("Invalid access token.");
  }

  const expectedSignature = await sign(`${encodedHeader}.${encodedBody}`);

  if (!constantTimeEqual(signature, expectedSignature)) {
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
