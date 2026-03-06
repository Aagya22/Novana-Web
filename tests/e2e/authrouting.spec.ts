import { expect, test, type Page } from "@playwright/test";

async function expectRedirectToLogin(page: Page, route: string) {
  await page.goto(route);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
}

test("1) landing shows hero heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /take care of your/i })).toBeVisible();
});

test("2) landing shows feature section links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^features$/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /how it works/i }).first()).toBeVisible();
});

test("3) landing navbar login navigates to login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^log in$/i }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});

test("4) landing get started navigates to register", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /get started/i }).first().click();
  await expect(page).toHaveURL(/\/register$/);
});

test("5) login page renders form controls", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  await expect(page.getByPlaceholder("Your password")).toBeVisible();
  await expect(page.getByRole("button", { name: /^log in$/i })).toBeVisible();
});

test("6) login forgot-password link goes to request-password-reset", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: /forgot password/i }).click();
  await expect(page).toHaveURL(/\/request-password-reset$/);
});

test("7) login sign-up link goes to register", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("8) register page renders required fields", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
  await expect(page.getByPlaceholder("Your full name")).toBeVisible();
  await expect(page.getByPlaceholder("Choose a username")).toBeVisible();
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  await expect(page.getByPlaceholder(/\+1 234 567 8900/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
});

test("9) register login link goes to login", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("link", { name: /^log in$/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("10) request-password-reset page renders email form", async ({ page }) => {
  await page.goto("/request-password-reset");
  await expect(page.getByRole("heading", { name: /forgot password/i })).toBeVisible();
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
});

test("11) request-password-reset back-to-login button navigates", async ({ page }) => {
  await page.goto("/request-password-reset");
  await page.getByRole("button", { name: /back to login/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("12) reset-password page renders password fields", async ({ page }) => {
  await page.goto("/reset-password?token=dummy-token");
  await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
  await expect(page.getByPlaceholder("Enter your new password")).toBeVisible();
  await expect(page.getByPlaceholder("Confirm your new password")).toBeVisible();
  await expect(page.getByRole("button", { name: /reset password/i })).toBeVisible();
});

test("13) reset-password request-new-link navigates", async ({ page }) => {
  await page.goto("/reset-password?token=dummy-token");
  await page.getByRole("link", { name: /request a new one/i }).click();
  await expect(page).toHaveURL(/\/request-password-reset$/);
});

test("14) /home redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/home");
});

test("15) /journal redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/journal");
});

test("16) /mood redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/mood");
});

test("17) /reminders redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/reminders");
});

test("18) /calendar redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/calendar");
});

test("19) /settings redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/settings");
});

test("20) /admin/dashboard redirects to /login when unauthenticated", async ({ page }) => {
  await expectRedirectToLogin(page, "/admin/dashboard");
});
