import { expect, test } from "@playwright/test";

test.describe("public catalog", () => {
  test("home page renders", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Discover what to watch next with Watchloom/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse movies/i }).first()).toBeVisible();
  });

  test("anonymous user can browse and search movies", async ({ page }) => {
    await page.goto("/movies");

    await expect(page.getByRole("heading", { name: "Movies" })).toBeVisible();
    await expect(page.getByRole("link", { name: "The Matrix", exact: true })).toBeVisible();

    await page.getByRole("searchbox", { name: /search movies/i }).fill("arrival");
    await page.getByRole("button", { name: /search/i }).click();

    await expect(page).toHaveURL(/q=arrival/);
    await expect(page.getByRole("link", { name: /Arrival/i })).toBeVisible();
  });

  test("anonymous user can view movie details", async ({ page }) => {
    await page.goto("/movies/the-matrix");

    await expect(page.getByRole("heading", { name: "The Matrix" })).toBeVisible();
    await expect(page.getByText("A hacker discovers reality is not what it seems.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("anonymous user can browse series and view seasons/episodes", async ({ page }) => {
    await page.goto("/series");

    await expect(page.getByRole("heading", { name: "Series" })).toBeVisible();
    const breakingBadLink = page.getByRole("link", { name: "Breaking Bad", exact: true });

    await expect(breakingBadLink).toBeVisible();

    await breakingBadLink.click();
    await expect(page.getByRole("heading", { name: "Breaking Bad" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Seasons" })).toBeVisible();

    await page.getByRole("link", { name: /Season 1/i }).click();
    await expect(page.getByRole("heading", { name: "Season 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Episodes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pilot" })).toBeVisible();
  });
});
