import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth validation schemas", () => {
  it("valid login input passes", () => {
    const result = loginSchema.safeParse({
      email: "user@watchloom.dev",
      password: "password",
    });

    expect(result.success).toBe(true);
  });

  it("invalid email fails", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password",
    });

    expect(result.success).toBe(false);
  });

  it("empty password fails", () => {
    const result = loginSchema.safeParse({
      email: "user@watchloom.dev",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("register requires username", () => {
    const result = registerSchema.safeParse({
      email: "user@watchloom.dev",
      username: "",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("register requires password min length", () => {
    const result = registerSchema.safeParse({
      email: "user@watchloom.dev",
      username: "watcher",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
