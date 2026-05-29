import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password helpers", () => {
  const plainPassword = "CorrectHorseBatteryStaple123!";

  it("hashPassword returns a hash different from the original password", async () => {
    const hash = await hashPassword(plainPassword);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(plainPassword);
  });

  it("verifyPassword returns true for the correct password", async () => {
    const hash = await hashPassword(plainPassword);

    await expect(verifyPassword(plainPassword, hash)).resolves.toBe(true);
  });

  it("verifyPassword returns false for the wrong password", async () => {
    const hash = await hashPassword(plainPassword);

    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("password hash is never equal to plain text", async () => {
    const hash = await hashPassword(plainPassword);

    expect(hash === plainPassword).toBe(false);
  });
});
