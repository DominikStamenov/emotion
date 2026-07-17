export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, RequiredInsertKeys extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type ContentStatus = Database["public"]["Enums"]["content_status"];

type ProfileRow = Timestamps & {
  account_type: "staff" | "client";
  active: boolean;
  avatar_url: string | null;
  display_name: string | null;
  id: string;
  last_seen_at: string | null;
  role: Database["public"]["Enums"]["app_role"];
};

type SiteSettingRow = Timestamps & {
  id: string;
  is_public: boolean;
  key: string;
  updated_by: string | null;
  value: Json;
};

type AuditLogRow = {
  action: string;
  actor_id: string | null;
  after_data: Json | null;
  before_data: Json | null;
  created_at: string;
  entity_id: string | null;
  entity_type: string;
  id: number;
  ip_hash: string | null;
  metadata: Json;
};

type MediaAssetRow = Timestamps & {
  alt_text: string | null;
  bucket: string;
  created_by: string | null;
  deleted_at: string | null;
  filename: string;
  focal_point: Json | null;
  height: number | null;
  id: string;
  metadata: Json;
  mime_type: string;
  path: string;
  rights: Json;
  size_bytes: number;
  width: number | null;
};

type PageRow = Timestamps & {
  created_by: string | null;
  id: string;
  locale: string;
  page_type: string;
  published_at: string | null;
  seo: Json;
  slug: string;
  status: ContentStatus;
  summary: string | null;
  title: string;
  updated_by: string | null;
};

type PageSectionRow = Timestamps & {
  content: Json;
  id: string;
  page_id: string;
  position: number;
  section_type: string;
};

type ServiceRow = Timestamps & {
  content: Json;
  created_by: string | null;
  id: string;
  locale: string;
  position: number;
  published_at: string | null;
  seo: Json;
  short_description: string | null;
  slug: string;
  status: ContentStatus;
  title: string;
  updated_by: string | null;
};

type ProjectRow = Timestamps & {
  client_name: string | null;
  content: Json;
  cover_asset_id: string | null;
  created_by: string | null;
  id: string;
  is_seed: boolean;
  locale: string;
  published_at: string | null;
  seo: Json;
  slug: string;
  status: ContentStatus;
  summary: string | null;
  title: string;
  updated_by: string | null;
  verified_at: string | null;
  year: number | null;
};

type TestimonialRow = Timestamps & {
  company_name: string | null;
  company_url: string | null;
  created_by: string | null;
  id: string;
  is_seed: boolean;
  is_verified: boolean;
  person_name: string;
  person_role: string | null;
  position: number;
  published_at: string | null;
  quote: string;
  status: ContentStatus;
  updated_by: string | null;
};

type PersonRow = Timestamps & {
  biography: string | null;
  created_by: string | null;
  id: string;
  links: Json;
  name: string;
  portrait_asset_id: string | null;
  position: number;
  published_at: string | null;
  role_title: string | null;
  slug: string;
  status: ContentStatus;
  updated_by: string | null;
};

type CategoryRow = Timestamps & {
  description: string | null;
  id: string;
  name: string;
  slug: string;
};

type InsightRow = Timestamps & {
  author_profile_id: string | null;
  content: Json;
  cover_asset_id: string | null;
  created_by: string | null;
  excerpt: string | null;
  id: string;
  locale: string;
  published_at: string | null;
  seo: Json;
  slug: string;
  status: ContentStatus;
  title: string;
  updated_by: string | null;
};

type InsightCategoryRow = {
  category_id: string;
  insight_id: string;
};

type NavigationItemRow = Timestamps & {
  href: string;
  id: string;
  is_active: boolean;
  is_external: boolean;
  label: string;
  locale: string;
  navigation_key: string;
  parent_id: string | null;
  position: number;
};

type ContentRevisionRow = {
  created_at: string;
  created_by: string | null;
  entity_id: string;
  entity_type: string;
  id: number;
  note: string | null;
  revision: number;
  snapshot: Json;
};

type OrganizationRow = Timestamps & {
  billing_details: Json;
  id: string;
  industry: string | null;
  metadata: Json;
  name: string;
  owner_id: string | null;
  size_label: string | null;
  website: string | null;
};

type ContactRow = Timestamps & {
  consent_at: string | null;
  email: string | null;
  first_name: string | null;
  id: string;
  job_title: string | null;
  last_name: string | null;
  locale: string | null;
  marketing_consent_at: string | null;
  metadata: Json;
  organization_id: string | null;
  owner_id: string | null;
  phone: string | null;
  source: string | null;
};

type InquiryRow = Timestamps & {
  assigned_to: string | null;
  attribution: Json;
  budget_range: string | null;
  company: string | null;
  consent_at: string;
  contact_id: string | null;
  email: string;
  id: string;
  marketing_consent: boolean;
  message: string;
  metadata: Json;
  name: string;
  organization_id: string | null;
  processed_at: string | null;
  requested_services: string[];
  source: string;
  status: Database["public"]["Enums"]["inquiry_status"];
  timeframe: string | null;
};

type LeadRow = Timestamps & {
  contact_id: string | null;
  converted_at: string | null;
  id: string;
  inquiry_id: string | null;
  lost_reason: string | null;
  next_action: string | null;
  next_action_at: string | null;
  organization_id: string | null;
  owner_id: string | null;
  qualification: Json;
  score: number;
  source: string | null;
  status: Database["public"]["Enums"]["lead_status"];
};

type OpportunityRow = Timestamps & {
  contact_id: string | null;
  currency: string;
  estimated_value: number | null;
  expected_close_at: string | null;
  id: string;
  lead_id: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  next_step: string | null;
  next_step_at: string | null;
  organization_id: string | null;
  owner_id: string | null;
  probability: number;
  stage: Database["public"]["Enums"]["opportunity_stage"];
  title: string;
  won_at: string | null;
};

type ActivityRow = {
  activity_type: Database["public"]["Enums"]["activity_type"];
  actor_id: string | null;
  body: string | null;
  contact_id: string | null;
  created_at: string;
  id: string;
  lead_id: string | null;
  metadata: Json;
  occurred_at: string;
  opportunity_id: string | null;
  organization_id: string | null;
  subject: string;
};

type TaskRow = Timestamps & {
  assignee_id: string | null;
  completed_at: string | null;
  contact_id: string | null;
  created_by: string | null;
  description: string | null;
  due_at: string | null;
  id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  priority: number;
  status: Database["public"]["Enums"]["task_status"];
  title: string;
};

type NoteRow = Timestamps & {
  body: string;
  contact_id: string | null;
  created_by: string | null;
  id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  organization_id: string | null;
};

type KnowledgeDocumentRow = Timestamps & {
  content: string;
  content_hash: string;
  embedded_at: string | null;
  embedding: string | null;
  id: string;
  locale: string;
  metadata: Json;
  source_id: string | null;
  source_type: string;
  status: ContentStatus;
  title: string;
  visibility: Database["public"]["Enums"]["knowledge_visibility"];
};

type AiConversationRow = Timestamps & {
  channel: string;
  closed_at: string | null;
  contact_id: string | null;
  handoff_requested_at: string | null;
  id: string;
  inquiry_id: string | null;
  last_message_at: string | null;
  metadata: Json;
  owner_id: string | null;
  qualification: Json;
  status: Database["public"]["Enums"]["ai_conversation_status"];
  summary: string | null;
  visitor_session_hash: string | null;
};

type AiMessageRow = {
  citations: Json;
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  input_tokens: number | null;
  latency_ms: number | null;
  model: string | null;
  output_tokens: number | null;
  prompt_version: string | null;
  role: Database["public"]["Enums"]["ai_message_role"];
  safety: Json;
};

type AiFeedbackRow = {
  created_at: string;
  id: string;
  message_id: string;
  rating: number | null;
  reason: string | null;
  submitted_by: string | null;
};

type PromptVersionRow = {
  active: boolean;
  configuration: Json;
  created_at: string;
  created_by: string | null;
  id: string;
  prompt_key: string;
  template: string;
  version: number;
};

type RedirectRow = Timestamps & {
  active: boolean;
  created_by: string | null;
  id: string;
  source_path: string;
  status_code: number;
  target_path: string;
  updated_by: string | null;
};

type TagRow = Timestamps & {
  id: string;
  name: string;
  slug: string;
};

type ContentTagRow = {
  created_at: string;
  entity_id: string;
  entity_type: string;
  tag_id: string;
};

type AttachmentRow = {
  created_at: string;
  created_by: string | null;
  entity_id: string;
  entity_type: string;
  id: string;
  is_private: boolean;
  label: string | null;
  media_asset_id: string;
};

type ProposalRow = Timestamps & {
  accepted_at: string | null;
  amount: number | null;
  content: Json;
  created_by: string | null;
  currency: string;
  expires_at: string | null;
  id: string;
  opportunity_id: string;
  rejected_at: string | null;
  sent_at: string | null;
  status: Database["public"]["Enums"]["proposal_status"];
  title: string;
  updated_by: string | null;
  version: number;
};

type EngagementRow = Timestamps & {
  budget: number | null;
  completed_at: string | null;
  currency: string;
  id: string;
  opportunity_id: string | null;
  organization_id: string | null;
  owner_id: string | null;
  primary_contact_id: string | null;
  start_date: string | null;
  status: Database["public"]["Enums"]["engagement_status"];
  summary: string | null;
  target_end_date: string | null;
  title: string;
};

type DeliverableRow = Timestamps & {
  approved_at: string | null;
  delivered_at: string | null;
  description: string | null;
  due_at: string | null;
  engagement_id: string;
  id: string;
  metadata: Json;
  owner_id: string | null;
  position: number;
  status: Database["public"]["Enums"]["deliverable_status"];
  title: string;
};

type ClientPortalAccessRow = {
  access_role: string;
  active: boolean;
  engagement_id: string;
  id: string;
  invited_at: string;
  last_accessed_at: string | null;
  user_id: string;
};

type ProjectMilestoneRow = Timestamps & {
  completed_at: string | null;
  description: string | null;
  due_at: string | null;
  engagement_id: string;
  id: string;
  position: number;
  starts_at: string | null;
  status: Database["public"]["Enums"]["milestone_status"];
  title: string;
};

type PortalFeedbackRow = Timestamps & {
  author_user_id: string;
  body: string;
  decision: Database["public"]["Enums"]["portal_feedback_decision"];
  deliverable_id: string | null;
  engagement_id: string;
  id: string;
  resolved_at: string | null;
  resolved_by: string | null;
};

type PortalNotificationRow = {
  body: string | null;
  created_at: string;
  engagement_id: string | null;
  href: string | null;
  id: string;
  notification_type: string;
  read_at: string | null;
  title: string;
  user_id: string;
};

type LegalDocumentRow = Timestamps & {
  content: Json;
  created_by: string | null;
  document_type: string;
  effective_at: string | null;
  id: string;
  locale: string;
  published_at: string | null;
  status: ContentStatus;
  title: string;
  updated_by: string | null;
  version: number;
};

type ConsentRecordRow = {
  consent_type: string;
  contact_id: string | null;
  created_at: string;
  granted: boolean;
  id: string;
  inquiry_id: string | null;
  ip_hash: string | null;
  legal_document_id: string | null;
  metadata: Json;
  user_agent: string | null;
  visitor_session_hash: string | null;
};

type WebEventRow = {
  attribution: Json;
  contact_id: string | null;
  event_name: string;
  id: number;
  inquiry_id: string | null;
  occurred_at: string;
  path: string;
  properties: Json;
  referrer: string | null;
  visitor_session_hash: string | null;
};

type AutomationJobRow = Timestamps & {
  attempts: number;
  completed_at: string | null;
  id: string;
  job_type: string;
  last_error: string | null;
  max_attempts: number;
  payload: Json;
  result: Json | null;
  run_at: string;
  started_at: string | null;
  status: Database["public"]["Enums"]["job_status"];
};

type EmailDeliveryRow = Timestamps & {
  conversation_id: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  id: string;
  inquiry_id: string | null;
  metadata: Json;
  provider_message_id: string | null;
  recipient_hash: string;
  sent_at: string | null;
  status: Database["public"]["Enums"]["email_delivery_status"];
  template_key: string;
};

type RateLimitBucketRow = {
  action: string;
  blocked_until: string | null;
  key_hash: string;
  request_count: number;
  updated_at: string;
  window_started_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id">;
      site_settings: Table<SiteSettingRow, "key">;
      audit_logs: Table<AuditLogRow, "action" | "entity_type">;
      media_assets: Table<
        MediaAssetRow,
        "bucket" | "filename" | "mime_type" | "path" | "size_bytes"
      >;
      pages: Table<PageRow, "slug" | "title">;
      page_sections: Table<
        PageSectionRow,
        "page_id" | "position" | "section_type"
      >;
      services: Table<ServiceRow, "slug" | "title">;
      projects: Table<ProjectRow, "slug" | "title">;
      testimonials: Table<TestimonialRow, "person_name" | "quote">;
      people: Table<PersonRow, "name" | "slug">;
      categories: Table<CategoryRow, "name" | "slug">;
      insights: Table<InsightRow, "slug" | "title">;
      insight_categories: Table<
        InsightCategoryRow,
        "category_id" | "insight_id"
      >;
      navigation_items: Table<
        NavigationItemRow,
        "href" | "label" | "navigation_key"
      >;
      content_revisions: Table<
        ContentRevisionRow,
        "entity_id" | "entity_type" | "revision" | "snapshot"
      >;
      organizations: Table<OrganizationRow, "name">;
      contacts: Table<ContactRow>;
      inquiries: Table<InquiryRow, "consent_at" | "email" | "message" | "name">;
      leads: Table<LeadRow>;
      opportunities: Table<OpportunityRow, "title">;
      activities: Table<ActivityRow, "activity_type" | "subject">;
      tasks: Table<TaskRow, "title">;
      notes: Table<NoteRow, "body">;
      knowledge_documents: Table<
        KnowledgeDocumentRow,
        "content" | "content_hash" | "source_type" | "title"
      >;
      ai_conversations: Table<AiConversationRow>;
      ai_messages: Table<AiMessageRow, "content" | "conversation_id" | "role">;
      ai_feedback: Table<AiFeedbackRow, "message_id">;
      prompt_versions: Table<
        PromptVersionRow,
        "prompt_key" | "template" | "version"
      >;
      redirects: Table<RedirectRow, "source_path" | "target_path">;
      tags: Table<TagRow, "name" | "slug">;
      content_tags: Table<
        ContentTagRow,
        "entity_id" | "entity_type" | "tag_id"
      >;
      attachments: Table<
        AttachmentRow,
        "entity_id" | "entity_type" | "media_asset_id"
      >;
      proposals: Table<ProposalRow, "opportunity_id" | "title">;
      engagements: Table<EngagementRow, "title">;
      deliverables: Table<DeliverableRow, "engagement_id" | "title">;
      client_portal_access: Table<
        ClientPortalAccessRow,
        "engagement_id" | "user_id"
      >;
      project_milestones: Table<ProjectMilestoneRow, "engagement_id" | "title">;
      portal_feedback: Table<
        PortalFeedbackRow,
        "author_user_id" | "body" | "engagement_id"
      >;
      portal_notifications: Table<
        PortalNotificationRow,
        "notification_type" | "title" | "user_id"
      >;
      legal_documents: Table<
        LegalDocumentRow,
        "document_type" | "title" | "version"
      >;
      consent_records: Table<ConsentRecordRow, "consent_type" | "granted">;
      web_events: Table<WebEventRow, "event_name" | "path">;
      automation_jobs: Table<AutomationJobRow, "job_type">;
      email_deliveries: Table<
        EmailDeliveryRow,
        "recipient_hash" | "template_key"
      >;
      rate_limit_buckets: Table<RateLimitBucketRow, "action" | "key_hash">;
    };
    Views: Record<string, never>;
    Functions: {
      can_access_crm: { Args: Record<never, never>; Returns: boolean };
      can_manage_content: { Args: Record<never, never>; Returns: boolean };
      can_use_ai: { Args: Record<never, never>; Returns: boolean };
      current_app_role: {
        Args: Record<never, never>;
        Returns: Database["public"]["Enums"]["app_role"] | null;
      };
      has_app_role: {
        Args: {
          required_roles: Database["public"]["Enums"]["app_role"][];
        };
        Returns: boolean;
      };
      has_client_portal_access: {
        Args: { p_engagement_id: string };
        Returns: boolean;
      };
      match_knowledge_documents: {
        Args: {
          include_internal?: boolean;
          match_count?: number;
          query_embedding: string;
          requested_locale?: string;
        };
        Returns: {
          content: string;
          id: string;
          metadata: Json;
          similarity: number;
          title: string;
        }[];
      };
      consume_rate_limit: {
        Args: {
          p_action: string;
          p_key_hash: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      qualify_inquiry: {
        Args: {
          p_inquiry_id: string;
          p_owner_id?: string;
        };
        Returns: string;
      };
      submit_public_inquiry: {
        Args: {
          p_attribution: Json;
          p_budget_range: string;
          p_company: string;
          p_email: string;
          p_ip_hash: string;
          p_marketing_consent: boolean;
          p_message: string;
          p_metadata: Json;
          p_name: string;
          p_requested_services: string[];
          p_timeframe: string;
          p_user_agent: string;
        };
        Returns: string;
      };
      submit_deliverable_feedback: {
        Args: {
          p_body: string;
          p_decision?: Database["public"]["Enums"]["portal_feedback_decision"];
          p_deliverable_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      activity_type:
        | "email"
        | "call"
        | "meeting"
        | "note"
        | "stage_change"
        | "system";
      ai_conversation_status:
        | "active"
        | "handoff_requested"
        | "closed"
        | "blocked";
      ai_message_role: "system" | "user" | "assistant" | "tool";
      app_role: "owner" | "admin" | "editor" | "sales" | "viewer";
      content_status: "draft" | "scheduled" | "published" | "archived";
      deliverable_status:
        | "planned"
        | "in_progress"
        | "review"
        | "approved"
        | "delivered";
      email_delivery_status:
        | "queued"
        | "sent"
        | "delivered"
        | "bounced"
        | "complained"
        | "failed";
      engagement_status:
        | "planning"
        | "active"
        | "on_hold"
        | "completed"
        | "cancelled";
      inquiry_status: "new" | "reviewing" | "qualified" | "closed" | "spam";
      knowledge_visibility: "public" | "internal";
      milestone_status: "planned" | "active" | "completed" | "delayed";
      job_status: "queued" | "running" | "completed" | "failed" | "cancelled";
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "nurturing"
        | "converted"
        | "lost";
      opportunity_stage:
        | "new_inquiry"
        | "reviewing"
        | "qualified"
        | "discovery_scheduled"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost";
      proposal_status: "draft" | "sent" | "accepted" | "rejected" | "expired";
      portal_feedback_decision: "comment" | "approved" | "changes_requested";
      task_status: "open" | "in_progress" | "completed" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
