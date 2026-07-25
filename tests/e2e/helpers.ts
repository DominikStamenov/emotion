import { expect, type Page, type Response } from "@playwright/test";

export function expectSuccessfulResponse(response: Response | null) {
  expect(response, "Navigation should return a response").not.toBeNull();
  expect(response?.status(), "Route should not return an error").toBeLessThan(
    400,
  );
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

  expect(
    overflow,
    "Page should fit within the configured viewport",
  ).toBeLessThanOrEqual(1);
}

export function expectPrivateHeaders(response: Response | null) {
  expectSuccessfulResponse(response);

  const headers = response?.headers() || {};

  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-robots-tag"]).toContain("noindex");
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
}
