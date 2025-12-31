import { test, expect } from "@playwright/test";

test("user can register and is redirected to profile", async ({ page }) => {
  // Mock signup endpoint
  await page.route("**/auth/signup**", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "fake-jwt-token",
      }),
    });
  });

  await page.goto("/login");

  // Switch to register mode
  await page.getByRole("button", { name: /create an account/i }).click();

  await page.getByPlaceholder("Username").fill("testuser");
  await page.getByPlaceholder("Email").fill("test@example.com");
  await page.getByPlaceholder("Password").fill("password123");

  await page.getByRole("button", { name: /register/i }).click();

  await page.waitForURL("**/profile");

  await expect(page.evaluate(() => localStorage.getItem("token"))).resolves.toBe("fake-jwt-token");
});

test("user can login and is redirected to profile", async ({ page }) => {
  // Mock login endpoint
  await page.route("**/auth/login**", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "fake-jwt-token",
      }),
    });
  });

  await page.goto("/login");

  await page.getByPlaceholder("Email").fill("test@example.com");
  await page.getByPlaceholder("Password").fill("password123");

  await page.getByRole("button", { name: /login/i }).click();

  await page.waitForURL("**/profile");

  await expect(page.evaluate(() => localStorage.getItem("token"))).resolves.toBe("fake-jwt-token");
});
