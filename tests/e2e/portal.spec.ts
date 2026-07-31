import { expect, test } from "@playwright/test";

import { expectNoHorizontalOverflow, expectPrivateHeaders } from "./helpers";

const demoProjectId = "11111111-1111-4111-8111-111111111111";

test("portal demo communicates project state", async ({ page }) => {
  const response = await page.goto("/");

  expectPrivateHeaders(response);
  await expect(page).toHaveTitle(/Client Portal/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Good to see you, Dominik." }),
  ).toBeVisible();
  await expect(page.getByText("Investor demo")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Aurelia digital platform/ }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if ((page.viewportSize()?.width || 0) <= 820) {
    await expect(
      page.getByRole("navigation", { name: "Mobile client portal" }),
    ).toBeVisible();
  }
});

test("portal demo project is reviewable", async ({ page }) => {
  expectPrivateHeaders(await page.goto(`/projects/${demoProjectId}`));
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByText("Aurelia digital platform")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
