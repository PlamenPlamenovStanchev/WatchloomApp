import { createHmac, timingSafeEqual } from "node:crypto";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 60;
const JWT_ALGORITHM = "HS256";
const JWT_TYPE = "JWT";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type AccessTokenPayload = Record<string, JsonValue | undefined>;
export type VerifiedAccessTokenPayload = AccessTokenPayload & {
  exp: number;
  iat: number;
};

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

export const signAccessToken = (payload: AccessTokenPayload) => {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: JWT_ALGORITHM,
    typ: JWT_TYPE,
  };
  const body = {
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

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("exp" in payload) ||
    !("iat" in payload) ||
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number"
  ) {
    throw new Error("Invalid access token.");
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Access token has expired.");
  }

  return payload as VerifiedAccessTokenPayload;
};
