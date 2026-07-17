import { describe, expect, it } from "vitest";

import {
  createAppPlan,
  createComponentPlan,
  normalizeName,
  parseArguments,
  toPascalCase,
} from "../packages/cli/src/index.mjs";

describe("eMotion CLI", () => {
  it("normalizes safe workspace names", () => {
    expect(normalizeName("Client Portal")).toBe("client-portal");
    expect(normalizeName("StatusCard")).toBe("status-card");
    expect(() => normalizeName("../")).toThrow();
  });

  it("creates stable component names", () => {
    expect(toPascalCase("project-status-card")).toBe("ProjectStatusCard");
  });

  it("parses commands and explicit options", () => {
    expect(
      parseArguments([
        "create",
        "client-portal",
        "--surface=portal",
        "--dry-run",
      ]),
    ).toEqual({
      command: "create",
      name: "client-portal",
      options: { surface: "portal", dryRun: true },
    });
  });

  it("plans a complete Next application without writing it", () => {
    const plan = createAppPlan("partner-room", "portal");
    const paths = plan.map((file) => file.relativePath);

    expect(paths).toContain("apps/partner-room/package.json");
    expect(paths).toContain("apps/partner-room/app/page.tsx");
    expect(paths).toContain("apps/partner-room/app/layout.tsx");
  });

  it("plans UI components with a story and export", () => {
    const plan = createComponentPlan("status-card", "ui");

    expect(plan.files).toHaveLength(3);
    expect(plan.exportLine).toContain("StatusCard");
    expect(plan.indexPath).toBe("packages/ui/src/index.ts");
  });
});
