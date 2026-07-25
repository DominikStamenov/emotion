import {
  getForwardedClientAddress,
  hasInvalidRequestOrigin,
  hasOversizedRequestBody,
} from "../packages/domain/src";
import { describe, expect, it } from "vitest";

function createRequest(
  headers: Record<string, string> = {},
  origin = "https://emotion.com",
) {
  const normalized = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    headers: {
      get(name: string) {
        return normalized.get(name.toLowerCase()) || null;
      },
    },
    nextUrl: { origin },
  };
}

describe("public request security", () => {
  it("accepts missing and same-origin Origin headers", () => {
    expect(hasInvalidRequestOrigin(createRequest())).toBe(false);
    expect(
      hasInvalidRequestOrigin(createRequest({ origin: "https://emotion.com" })),
    ).toBe(false);
  });

  it("rejects cross-origin requests", () => {
    expect(
      hasInvalidRequestOrigin(
        createRequest({ origin: "https://attacker.test" }),
      ),
    ).toBe(true);
  });

  it("enforces declared request-body limits", () => {
    expect(
      hasOversizedRequestBody(
        createRequest({ "content-length": "5001" }),
        5000,
      ),
    ).toBe(true);
    expect(
      hasOversizedRequestBody(
        createRequest({ "content-length": "5000" }),
        5000,
      ),
    ).toBe(false);
    expect(hasOversizedRequestBody(createRequest(), 5000)).toBe(false);
  });

  it("uses the first forwarded address without storing the raw chain", () => {
    expect(
      getForwardedClientAddress(
        createRequest({ "x-forwarded-for": " 203.0.113.4, 10.0.0.1 " }),
      ),
    ).toBe("203.0.113.4");
    expect(
      getForwardedClientAddress(createRequest({ "x-real-ip": "198.51.100.8" })),
    ).toBe("198.51.100.8");
    expect(getForwardedClientAddress(createRequest())).toBe("unknown");
  });
});
