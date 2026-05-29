import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";

const originalJwtSecret = process.env.JWT_SECRET;

describe("JWT helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "unit-test-secret";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it("signAccessToken creates a token", async () => {
    const token = await signAccessToken({
      userId: 1,
      email: "editor@watchloom.dev",
      role: "editor",
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifyAccessToken returns the expected payload", async () => {
    const payload = {
      userId: 42,
      email: "admin@watchloom.dev",
      role: "admin" as const,
    };
    const token = await signAccessToken(payload);
    const verified = await verifyAccessToken(token);

    expect(verified).toMatchObject(payload);
    expect(typeof verified.iat).toBe("number");
    expect(typeof verified.exp).toBe("number");
  });

  it("invalid token is rejected", async () => {
    await expect(verifyAccessToken("not-a-valid-token")).rejects.toThrow("Invalid access token.");
  });

  it("missing JWT_SECRET is handled safely", async () => {
    delete process.env.JWT_SECRET;

    await expect(
      signAccessToken({
        userId: 1,
        email: "user@watchloom.dev",
        role: "user",
      }),
    ).rejects.toThrow("JWT_SECRET is not set.");
  });
});
