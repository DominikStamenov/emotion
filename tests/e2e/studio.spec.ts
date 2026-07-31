import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalOverflow,
  expectSuccessfulResponse,
} from "./helpers";

test("homepage preserves the conversion journey", async ({ page }) => {
  const response = await page.goto("/");

  expectSuccessfulResponse(response);
  await expect(page).toHaveTitle(/eMotion/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Emotion\s*becomes\s*motion\./,
  );
  await expect(page.locator("#services")).toBeVisible();
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: "Start a project" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if ((page.viewportSize()?.width || 0) <= 800) {
    const menu = page.getByText("Menu", { exact: true });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
  }

  const headers = response?.headers() || {};
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
});

test("core public routes render", async ({ page }) => {
  for (const path of [
    "/services",
    "/work",
    "/studio",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
  ]) {
    expectSuccessfulResponse(await page.goto(path));
    await expect(page.locator("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});
