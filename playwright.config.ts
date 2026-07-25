import { defineConfig } from "@playwright/test";

const desktop = { height: 900, width: 1440 };
const mobile = { height: 844, width: 390 };

export default defineConfig({
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: [
    {
      name: "studio-desktop",
      testMatch: "studio.spec.ts",
      use: { baseURL: "http://127.0.0.1:3100", viewport: desktop },
    },
    {
      name: "studio-mobile",
      testMatch: "studio.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3100",
        hasTouch: true,
        isMobile: true,
        viewport: mobile,
      },
    },
    {
      name: "admin-desktop",
      testMatch: "admin.spec.ts",
      use: { baseURL: "http://127.0.0.1:3101", viewport: desktop },
    },
    {
      name: "admin-mobile",
      testMatch: "admin.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3101",
        hasTouch: true,
        isMobile: true,
        viewport: mobile,
      },
    },
    {
      name: "portal-desktop",
      testMatch: "portal.spec.ts",
      use: { baseURL: "http://127.0.0.1:3102", viewport: desktop },
    },
    {
      name: "portal-mobile",
      testMatch: "portal.spec.ts",
      use: {
        baseURL: "http://127.0.0.1:3102",
        hasTouch: true,
        isMobile: true,
        viewport: mobile,
      },
    },
  ],
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --filter @emotion/web exec next start --port 3100",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://127.0.0.1:3100",
    },
    {
      command: "pnpm --filter @emotion/admin exec next start --port 3101",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://127.0.0.1:3101",
    },
    {
      command: "pnpm --filter @emotion/portal exec next start --port 3102",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      url: "http://127.0.0.1:3102",
    },
  ],
  workers: process.env.CI ? 1 : undefined,
});
