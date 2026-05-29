import { expect, test } from "@playwright/test";

import { loginAs, logout, seededPassword, users } from "./helpers";

test.describe("auth flows", () => {
  test("user can register, login, access dashboard, and logout", async ({ page }) => {
    const email = `registered-${Date.now()}@watchloom.test`;

    await page.goto("/register");
    await page.getByLabel("Username").fill("Registered E2E User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(seededPassword);
    await page.getByLabel("Confirm password").fill(seededPassword);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/login\?registered=1/);
    await expect(page.getByText("Account created. Log in to continue.")).toBeVisible();

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(seededPassword);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Welcome, Registered E2E User/ })).toBeVisible();

    await logout(page);
  });

  test("seeded user can login", async ({ page }) => {
    await loginAs(page, users.regular);
  });

  test("invalid login shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(users.regular);
    await page.getByLabel("Password").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });
});
