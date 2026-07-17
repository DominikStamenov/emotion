export const APP_ROLES = [
  "owner",
  "admin",
  "editor",
  "sales",
  "viewer",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const CONTENT_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "archived",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const INQUIRY_STATUSES = [
  "new",
  "reviewing",
  "qualified",
  "closed",
  "spam",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "nurturing",
  "converted",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const OPPORTUNITY_STAGES = [
  "new_inquiry",
  "reviewing",
  "qualified",
  "discovery_scheduled",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const TASK_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
