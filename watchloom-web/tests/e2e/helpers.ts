import { expect, type Page } from "@playwright/test";

export const seededPassword = "Password123!";

export const users = {
  regular: "user.integration@watchloom.dev",
  editor: "editor.integration@watchloom.dev",
  admin: "admin.integration@watchloom.dev",
};

export const loginAs = async (page: Page, email: string, password = seededPassword) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
};

export const logout = async (page: Page) => {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("/");
};
