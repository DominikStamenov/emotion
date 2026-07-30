import { describe, expect, it } from "vitest";

import {
  renderContactConfirmation,
  renderContactNotification,
} from "../packages/email/src";

const unsafeInquiry = {
  company: "Example & Partners",
  email: "hello@example.com",
  message: "<script>alert('x')</script> Build our platform.",
  name: "Ada <Admin>",
  requestedServices: ["Strategy", "Development"],
};

describe("transactional contact email", () => {
  it("escapes visitor-provided HTML in internal notifications", () => {
    const email = renderContactNotification(unsafeInquiry);

    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("Ada &lt;Admin&gt;");
    expect(email.text).toContain("Build our platform.");
  });

  it("escapes the visitor name in confirmation emails", () => {
    const email = renderContactConfirmation(unsafeInquiry);

    expect(email.html).toContain("Ada &lt;Admin&gt;");
    expect(email.subject).toContain("project brief");
    expect(email.text).toContain("e-mail address you provided");
  });
});
