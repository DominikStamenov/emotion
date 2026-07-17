import { describe, expect, it } from "vitest";

import {
  aiChatRequestSchema,
  contactInquirySchema,
  createProposalSchema,
  hasPermission,
  internalCopilotRequestSchema,
  opportunityStageSchema,
  portalFeedbackSchema,
  portalInviteSchema,
  slugSchema,
  updateContentSchema,
} from "../packages/domain/src";

describe("public input contracts", () => {
  it("normalizes a valid project inquiry", () => {
    const inquiry = contactInquirySchema.parse({
      consent: true,
      email: "  FOUNDER@EXAMPLE.COM ",
      message: "We need a new digital platform for our growing company.",
      name: "  Ada Lovelace ",
    });

    expect(inquiry.email).toBe("founder@example.com");
    expect(inquiry.name).toBe("Ada Lovelace");
    expect(inquiry.marketingConsent).toBe(false);
    expect(inquiry.requestedServices).toEqual([]);
  });

  it("rejects inquiries without consent or useful context", () => {
    const inquiry = contactInquirySchema.safeParse({
      consent: false,
      email: "founder@example.com",
      message: "Too short",
      name: "Ada",
    });

    expect(inquiry.success).toBe(false);
  });

  it("enforces bounded AI input and pipeline stages", () => {
    expect(aiChatRequestSchema.safeParse({ message: "Hi" }).success).toBe(true);
    expect(
      aiChatRequestSchema.safeParse({ message: "x".repeat(1201) }).success,
    ).toBe(false);
    expect(opportunityStageSchema.safeParse("proposal").success).toBe(true);
    expect(opportunityStageSchema.safeParse("paid").success).toBe(false);
    expect(
      internalCopilotRequestSchema.safeParse({
        message: "Summarize current risks",
        task: "summarize",
      }).success,
    ).toBe(true);
    expect(
      internalCopilotRequestSchema.safeParse({
        message: "Send this without review",
        task: "execute",
      }).success,
    ).toBe(false);
  });
});

describe("content and permission rules", () => {
  it("accepts URL-safe slugs only", () => {
    expect(slugSchema.safeParse("applied-ai-systems").success).toBe(true);
    expect(slugSchema.safeParse("Applied AI Systems").success).toBe(false);
    expect(slugSchema.safeParse("../admin").success).toBe(false);
  });

  it("keeps verification off unless explicitly approved", () => {
    const content = updateContentSchema.parse({
      collection: "testimonials",
      id: "8c8323a4-f16f-4f3d-85d3-6f91a099e822",
      locale: "en",
      slug: "temporary-testimonial",
      status: "draft",
      summary: "Temporary editorial placeholder",
      title: "Temporary testimonial",
    });

    expect(content.verified).toBe(false);
  });

  it("validates proposal ownership and non-negative value", () => {
    expect(
      createProposalSchema.safeParse({
        amount: "25000",
        opportunityId: "bd658ba9-92e7-4ff8-8ae6-6ea59570841f",
        title: "Digital platform proposal",
      }).success,
    ).toBe(true);
    expect(
      createProposalSchema.safeParse({
        amount: "-1",
        opportunityId: "not-an-id",
        title: "x",
      }).success,
    ).toBe(false);
  });

  it("validates Portal invitations and bounded client decisions", () => {
    const invite = portalInviteSchema.parse({
      displayName: "  Ada Lovelace ",
      email: " ADA@EXAMPLE.COM ",
      engagementId: "bd658ba9-92e7-4ff8-8ae6-6ea59570841f",
      role: "client_owner",
    });

    expect(invite.email).toBe("ada@example.com");
    expect(invite.displayName).toBe("Ada Lovelace");
    expect(
      portalFeedbackSchema.safeParse({
        body: "Approved for production.",
        decision: "approved",
        deliverableId: "8c8323a4-f16f-4f3d-85d3-6f91a099e822",
        engagementId: "bd658ba9-92e7-4ff8-8ae6-6ea59570841f",
      }).success,
    ).toBe(true);
    expect(
      portalFeedbackSchema.safeParse({
        body: "",
        decision: "publish_without_review",
        deliverableId: "not-an-id",
        engagementId: "not-an-id",
      }).success,
    ).toBe(false);
  });

  it("enforces least-privilege role capabilities", () => {
    expect(hasPermission("viewer", "content:read")).toBe(true);
    expect(hasPermission("viewer", "content:write")).toBe(false);
    expect(hasPermission("sales", "crm:write")).toBe(true);
    expect(hasPermission("editor", "crm:read")).toBe(false);
    expect(hasPermission("owner", "settings:manage")).toBe(true);
  });
});
