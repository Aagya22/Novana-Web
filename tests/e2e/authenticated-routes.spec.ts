import { expect, test, type Page } from "@playwright/test";

type Role = "user" | "admin";

const BASE_URL = "http://localhost:3004";

function buildUser(role: Role) {
  return {
    _id: role === "admin" ? "admin-e2e-id" : "user-e2e-id",
    fullName: role === "admin" ? "E2E Admin" : "E2E User",
    username: role === "admin" ? "e2e_admin" : "e2e_user",
    email: role === "admin" ? "admin.e2e@example.com" : "user.e2e@example.com",
    phoneNumber: "9800000001",
    role,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

async function seedAuth(page: Page, role: Role) {
  const user = buildUser(role);
  const token = `${role}-e2e-token`;

  await page.context().addCookies([
    { name: "auth_token", value: token, url: BASE_URL },
    { name: "user_data", value: JSON.stringify(user), url: BASE_URL },
  ]);

  await page.addInitScript(
    ({ seededToken, seededUser }) => {
      window.localStorage.setItem("token", seededToken);
      window.localStorage.setItem("user_data", JSON.stringify(seededUser));
    },
    { seededToken: token, seededUser: user }
  );
}

test("1) authenticated user can open /home", async ({ page }) => {
  await seedAuth(page, "user");
  await page.goto("/home");

  await expect(page).toHaveURL(/\/home$/);
});

test("2) authenticated user can open /journal", async ({ page }) => {
  await seedAuth(page, "user");
  await page.goto("/journal");

  await expect(page).toHaveURL(/\/journal$/);
});

test("3) authenticated user can open /mood", async ({ page }) => {
  await seedAuth(page, "user");
  await page.goto("/mood");

  await expect(page).toHaveURL(/\/mood$/);
});

test("4) non-admin user is redirected from /admin/dashboard to /home", async ({ page }) => {
  await seedAuth(page, "user");
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/home$/);
});

test("5) authenticated admin can open /admin/dashboard", async ({ page }) => {
  await seedAuth(page, "admin");
  await page.goto("/admin/dashboard");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});

test("6) authenticated admin can open /admin/users", async ({ page }) => {
  await seedAuth(page, "admin");
  await page.goto("/admin/users");

  await expect(page).toHaveURL(/\/admin\/users$/);
});

test("7) admin visiting /home is redirected to /admin/dashboard", async ({ page }) => {
  await seedAuth(page, "admin");
  await page.goto("/home");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});
