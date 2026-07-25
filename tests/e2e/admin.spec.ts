import { expect, test } from "@playwright/test";

import { expectNoHorizontalOverflow, expectPrivateHeaders } from "./helpers";

test("admin fails closed when external services are not configured", async ({
  page,
}) => {
  const response = await page.goto("/");

  expectPrivateHeaders(response);
  await expect(page).toHaveTitle(/eMotion Agency OS/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Platforma je spremna za povezivanje.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Sigurno stanje: pristup podacima nije otvoren"),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
