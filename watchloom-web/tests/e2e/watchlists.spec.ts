import { expect, test } from "@playwright/test";

import { loginAs, users } from "./helpers";

test.describe("watchlists, favourites, and reviews", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, users.regular);
  });

  test("logged-in user can manage a watchlist and item", async ({ page }) => {
    const listName = `E2E Watchlist ${Date.now()}`;

    await page.goto("/dashboard/watchlists");
    await page.getByRole("link", { name: "New watchlist" }).click();
    await page.getByLabel("Name").fill(listName);
    await page.getByLabel("Description").fill("Created by Playwright.");
    await page.getByRole("button", { name: "Create watchlist" }).click();

    await expect(page.getByRole("heading", { name: listName })).toBeVisible();

    await page.goto("/movies/arrival");
    const addToWatchlistForm = page.locator("form", {
      has: page.getByRole("button", { name: "Add to Watchlist" }),
    });
    await addToWatchlistForm.getByRole("combobox", { name: "Watchlist" }).selectOption({
      label: listName,
    });
    await addToWatchlistForm.getByLabel("Status").selectOption("watching");
    await addToWatchlistForm.getByLabel("Rating").selectOption("5");
    await addToWatchlistForm.getByLabel("Planned time").fill("2030-01-02T20:30");
    await addToWatchlistForm.getByLabel("Notes").fill("Watch with subtitles.");
    await addToWatchlistForm.getByRole("button", { name: "Add to Watchlist" }).click();

    await expect(page).toHaveURL(/\/dashboard\/watchlists\/\d+/);
    await expect(page.getByRole("heading", { name: listName })).toBeVisible();
    await expect(page.getByRole("link", { name: "Arrival" })).toBeVisible();

    await page.getByLabel("Status").selectOption("watched");
    await page.getByLabel("Rating").selectOption("4");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByLabel("Status")).toHaveValue("watched");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("link", { name: "Arrival" })).toHaveCount(0);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL(/\/dashboard\/watchlists$/);
    await expect(page.getByRole("link", { name: new RegExp(listName) })).toHaveCount(0);
  });

  test("logged-in user can favourite a movie and see it in dashboard", async ({ page }) => {
    await page.goto("/movies/arrival");
    await page.getByRole("button", { name: "Add to Favourites" }).click();

    await expect(page.getByRole("button", { name: "Remove from Favourites" })).toBeVisible();

    await page.goto("/dashboard/favourites");
    await expect(page.getByRole("link", { name: "Arrival" })).toBeVisible();
  });

  test("logged-in user can write and update a review", async ({ page }) => {
    await page.goto("/movies/arrival");
    const reviewForm = page.locator("form", {
      has: page.getByRole("button", { name: "Create review" }),
    });
    await reviewForm.getByLabel("Rating").selectOption("5");
    await reviewForm.getByLabel("Title").fill("Playwright review");
    await reviewForm.getByLabel("Content").fill("This review came from a browser test.");
    await reviewForm.getByRole("button", { name: "Create review" }).click();

    await expect(page.getByText("Review saved.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Playwright review" })).toBeVisible();

    await page.goto("/dashboard/reviews");
    await expect(page.getByRole("link", { name: "Arrival" })).toBeVisible();
    const arrivalReview = page.getByRole("article").filter({
      has: page.getByRole("link", { name: "Arrival" }),
    });
    await arrivalReview.getByLabel("Title").fill("Updated Playwright review");
    await arrivalReview.getByRole("button", { name: "Update review" }).click();

    await expect(arrivalReview.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Updated Playwright review",
    );
  });
});
