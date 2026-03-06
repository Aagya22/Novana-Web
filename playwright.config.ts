import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3004",
    testIdAttribute: "data-testid",
    headless: !!process.env.CI,
    launchOptions: {
      // Keep UI interactions visible during local debugging.
      slowMo: process.env.CI ? 0 : 200,
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10000,
  },
  webServer: {
    command: "npm run dev -- --port 3004",
    url: "http://localhost:3004",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      E2E: "1",
    },
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
