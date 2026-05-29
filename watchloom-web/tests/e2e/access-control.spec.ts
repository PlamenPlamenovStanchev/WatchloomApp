import { expect, test } from "@playwright/test";

import { loginAs, users } from "./helpers";

test.describe("access control", () => {
  test("anonymous user cannot access dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.getByRole("heading", { name: /Log in/i })).toBeVisible();
  });

  test("regular user cannot access editor or admin", async ({ page }) => {
    await loginAs(page, users.regular);

    await page.goto("/editor");
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: "Forbidden" })).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: "Forbidden" })).toBeVisible();
  });

  test("editor can access editor but not admin", async ({ page }) => {
    await loginAs(page, users.editor);

    await page.goto("/editor");
    await expect(page.getByRole("heading", { name: "Quick links" })).toBeVisible();

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/forbidden/);
  });

  test("admin can access admin", async ({ page }) => {
    await loginAs(page, users.admin);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin areas" })).toBeVisible();
  });
});
