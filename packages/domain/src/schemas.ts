import { z } from "zod";

import { CONTENT_STATUSES, OPPORTUNITY_STAGES } from "./constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional();

const optionalUuid = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.uuid().optional(),
);

const optionalAmount = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().min(0).max(100000000).optional(),
);

export const publicSupabaseConfigSchema = z.object({
  publishableKey: z.string().trim().min(20),
  url: z.url().refine((url) => url.startsWith("https://"), {
    message: "Supabase URL must use HTTPS.",
  }),
});

export type PublicSupabaseConfig = z.infer<typeof publicSupabaseConfigSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(200),
});

export const contactInquirySchema = z.object({
  attribution: z
    .object({
      landingPage: optionalText(500),
      referrer: optionalText(500),
      utmCampaign: optionalText(200),
      utmContent: optionalText(200),
      utmMedium: optionalText(200),
      utmSource: optionalText(200),
      utmTerm: optionalText(200),
    })
    .default({}),
  budgetRange: optionalText(80),
  company: optionalText(160),
  conversationId: z.uuid().optional(),
  consent: z.literal(true, {
    error: "Consent is required to process the inquiry.",
  }),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  marketingConsent: z.boolean().default(false),
  message: z.string().trim().min(20).max(5000),
  name: z.string().trim().min(2).max(160),
  requestedServices: z
    .array(z.string().trim().min(1).max(100))
    .max(12)
    .default([]),
  timeframe: optionalText(80),
  website: optionalText(200),
});

export type ContactInquiry = z.infer<typeof contactInquirySchema>;

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const contentIdentitySchema = z.object({
  locale: z.string().trim().min(2).max(12).default("en"),
  slug: slugSchema,
  title: z.string().trim().min(2).max(200),
});

export const createContentSchema = contentIdentitySchema.extend({
  collection: z.enum([
    "pages",
    "services",
    "projects",
    "insights",
    "testimonials",
  ]),
  summary: z.string().trim().min(2).max(4000),
});

export const updateContentSchema = createContentSchema.extend({
  body: optionalText(30000),
  id: z.uuid(),
  publishAt: optionalText(40),
  status: z.enum(CONTENT_STATUSES),
  verified: z.boolean().default(false),
});

export const aiChatRequestSchema = z.object({
  conversationId: z.uuid().optional(),
  message: z.string().trim().min(2).max(1200),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export const internalCopilotRequestSchema = z.object({
  conversationId: z.uuid().optional(),
  message: z.string().trim().min(2).max(2000),
  task: z.enum(["ask", "summarize", "draft_follow_up", "draft_proposal"]),
});

export const opportunityStageSchema = z.enum(OPPORTUNITY_STAGES);

export const createTaskSchema = z.object({
  dueAt: optionalText(40),
  opportunityId: optionalUuid,
  title: z.string().trim().min(2).max(240),
});

export const createProposalSchema = z.object({
  amount: optionalAmount,
  opportunityId: z.uuid(),
  title: z.string().trim().min(2).max(240),
});

export const createEngagementSchema = z.object({
  budget: optionalAmount,
  opportunityId: optionalUuid,
  summary: optionalText(4000),
  targetEndDate: optionalText(40),
  title: z.string().trim().min(2).max(240),
});

export const createDeliverableSchema = z.object({
  description: optionalText(4000),
  dueAt: optionalText(40),
  engagementId: z.uuid(),
  title: z.string().trim().min(2).max(240),
});

export const portalFeedbackSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  decision: z
    .enum(["comment", "approved", "changes_requested"])
    .default("comment"),
  deliverableId: z.uuid(),
  engagementId: z.uuid(),
});

export type PortalFeedback = z.infer<typeof portalFeedbackSchema>;

export const portalInviteSchema = z.object({
  displayName: z.string().trim().min(2).max(160),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  engagementId: z.uuid(),
  role: z.enum(["client", "client_owner", "reviewer"]).default("client"),
});

export const createMilestoneSchema = z.object({
  description: optionalText(2000),
  dueAt: optionalText(40),
  engagementId: z.uuid(),
  startsAt: optionalText(40),
  title: z.string().trim().min(2).max(240),
});

export const consentPreferenceSchema = z.object({
  preference: z.enum(["analytics", "necessary"]),
});

export const webEventSchema = z.object({
  eventName: z.enum(["page_view", "contact_started", "ai_opened"]),
  path: z.string().trim().startsWith("/").max(500),
  properties: z
    .record(
      z.string().max(80),
      z.union([z.string().max(300), z.number(), z.boolean()]),
    )
    .default({}),
  referrer: z.string().trim().max(500).optional(),
});
