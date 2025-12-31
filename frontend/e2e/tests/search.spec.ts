import { test } from "@playwright/test";

test("search page loads and performs a search", async ({ page }) => {
  await page.goto("/search?q=Goblin");
});
