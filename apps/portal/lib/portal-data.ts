import type { Tables } from "@repo/database";
import { redirect } from "next/navigation";

import { getPublicSupabaseConfig } from "./supabase/config";
import { createClient } from "./supabase/server";

export type PortalFile = Tables<"attachments"> & {
  asset: Tables<"media_assets"> | null;
  downloadUrl: string | null;
};

export type PortalProject = {
  access: Tables<"client_portal_access">;
  engagement: Tables<"engagements">;
  deliverables: Tables<"deliverables">[];
  feedback: Tables<"portal_feedback">[];
  files: PortalFile[];
  milestones: Tables<"project_milestones">[];
};

export type PortalDashboard = {
  demo: boolean;
  notifications: Tables<"portal_notifications">[];
  profile: Pick<Tables<"profiles">, "account_type" | "display_name" | "id">;
  projects: PortalProject[];
};

const demoEngagementId = "11111111-1111-4111-8111-111111111111";
const demoUserId = "22222222-2222-4222-8222-222222222222";

const now = new Date().toISOString();

const demoDashboard: PortalDashboard = {
  demo: true,
  profile: {
    account_type: "client",
    display_name: "Dominik",
    id: demoUserId,
  },
  notifications: [
    {
      body: "Brand direction and homepage prototype are ready for your review.",
      created_at: now,
      engagement_id: demoEngagementId,
      href: `/projects/${demoEngagementId}`,
      id: "33333333-3333-4333-8333-333333333333",
      notification_type: "review_ready",
      read_at: null,
      title: "New deliverable ready",
      user_id: demoUserId,
    },
  ],
  projects: [
    {
      access: {
        access_role: "client_owner",
        active: true,
        engagement_id: demoEngagementId,
        id: "44444444-4444-4444-8444-444444444444",
        invited_at: now,
        last_accessed_at: now,
        user_id: demoUserId,
      },
      engagement: {
        budget: 48000,
        completed_at: null,
        created_at: "2026-05-18T08:00:00.000Z",
        currency: "EUR",
        id: demoEngagementId,
        opportunity_id: null,
        organization_id: null,
        owner_id: null,
        primary_contact_id: null,
        start_date: "2026-06-01",
        status: "active",
        summary:
          "A complete digital brand and commerce platform designed around a living identity system.",
        target_end_date: "2026-09-30",
        title: "Aurelia digital platform",
        updated_at: now,
      },
      deliverables: [
        {
          approved_at: now,
          created_at: now,
          delivered_at: now,
          description:
            "Positioning, messaging and strategic product narrative.",
          due_at: "2026-06-18T12:00:00.000Z",
          engagement_id: demoEngagementId,
          id: "55555555-5555-4555-8555-555555555551",
          metadata: {},
          owner_id: null,
          position: 0,
          status: "approved",
          title: "Brand strategy",
          updated_at: now,
        },
        {
          approved_at: null,
          created_at: now,
          delivered_at: now,
          description:
            "Interactive homepage prototype including motion direction and responsive states.",
          due_at: "2026-07-22T12:00:00.000Z",
          engagement_id: demoEngagementId,
          id: "55555555-5555-4555-8555-555555555552",
          metadata: {},
          owner_id: null,
          position: 1,
          status: "review",
          title: "Homepage prototype",
          updated_at: now,
        },
        {
          approved_at: null,
          created_at: now,
          delivered_at: null,
          description: "Design system, commerce flows and production build.",
          due_at: "2026-09-12T12:00:00.000Z",
          engagement_id: demoEngagementId,
          id: "55555555-5555-4555-8555-555555555553",
          metadata: {},
          owner_id: null,
          position: 2,
          status: "in_progress",
          title: "Platform build",
          updated_at: now,
        },
      ],
      feedback: [
        {
          author_user_id: demoUserId,
          body: "The strategic direction feels exactly right. Approved.",
          created_at: "2026-06-19T10:30:00.000Z",
          decision: "approved",
          deliverable_id: "55555555-5555-4555-8555-555555555551",
          engagement_id: demoEngagementId,
          id: "66666666-6666-4666-8666-666666666666",
          resolved_at: now,
          resolved_by: null,
          updated_at: now,
        },
      ],
      files: [],
      milestones: [
        {
          completed_at: "2026-06-20T12:00:00.000Z",
          created_at: now,
          description: "Discovery, positioning and brand narrative.",
          due_at: "2026-06-20",
          engagement_id: demoEngagementId,
          id: "77777777-7777-4777-8777-777777777771",
          position: 0,
          starts_at: "2026-06-01",
          status: "completed",
          title: "Strategy",
          updated_at: now,
        },
        {
          completed_at: null,
          created_at: now,
          description: "Identity system, digital direction and prototype.",
          due_at: "2026-07-31",
          engagement_id: demoEngagementId,
          id: "77777777-7777-4777-8777-777777777772",
          position: 1,
          starts_at: "2026-06-21",
          status: "active",
          title: "Design",
          updated_at: now,
        },
        {
          completed_at: null,
          created_at: now,
          description: "Production, QA and launch.",
          due_at: "2026-09-30",
          engagement_id: demoEngagementId,
          id: "77777777-7777-4777-8777-777777777773",
          position: 2,
          starts_at: "2026-08-01",
          status: "planned",
          title: "Build & launch",
          updated_at: now,
        },
      ],
    },
  ],
};

export async function getPortalDashboard(): Promise<PortalDashboard> {
  if (!getPublicSupabaseConfig()) {
    return demoDashboard;
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const [{ data: profile }, { data: accessRows }, { data: notifications }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, account_type")
        .eq("id", userId)
        .single(),
      supabase
        .from("client_portal_access")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true),
      supabase
        .from("portal_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  if (!profile || profile.account_type !== "client") {
    await supabase.auth.signOut();
    redirect("/login?error=Ovaj%20račun%20nema%20pristup%20Client%20Portalu.");
  }

  const access = accessRows ?? [];
  const engagementIds = access.map((row) => row.engagement_id);

  if (engagementIds.length === 0) {
    return {
      demo: false,
      notifications: notifications ?? [],
      profile,
      projects: [],
    };
  }

  const [engagementResult, deliverableResult, milestoneResult, feedbackResult] =
    await Promise.all([
      supabase.from("engagements").select("*").in("id", engagementIds),
      supabase
        .from("deliverables")
        .select("*")
        .in("engagement_id", engagementIds)
        .order("position"),
      supabase
        .from("project_milestones")
        .select("*")
        .in("engagement_id", engagementIds)
        .order("position"),
      supabase
        .from("portal_feedback")
        .select("*")
        .in("engagement_id", engagementIds)
        .order("created_at", { ascending: false }),
    ]);

  const engagements = engagementResult.data ?? [];
  const deliverables = deliverableResult.data ?? [];
  const deliverableIds = deliverables.map((item) => item.id);
  const engagementAttachmentFilter = `and(entity_type.eq.engagement,entity_id.in.(${engagementIds.join(",")}))`;
  const attachmentFilter = deliverableIds.length
    ? `${engagementAttachmentFilter},and(entity_type.eq.deliverable,entity_id.in.(${deliverableIds.join(",")}))`
    : engagementAttachmentFilter;

  const { data: attachmentRows } = await supabase
    .from("attachments")
    .select("*")
    .or(attachmentFilter);

  const attachments = attachmentRows ?? [];
  const assetIds = attachments.map((item) => item.media_asset_id);
  const { data: assetRows } = assetIds.length
    ? await supabase.from("media_assets").select("*").in("id", assetIds)
    : { data: [] as Tables<"media_assets">[] };

  const assets = new Map((assetRows ?? []).map((asset) => [asset.id, asset]));
  const portalFiles: PortalFile[] = await Promise.all(
    attachments.map(async (attachment) => {
      const asset = assets.get(attachment.media_asset_id) ?? null;

      if (!asset) {
        return { ...attachment, asset, downloadUrl: null };
      }

      const { data } = await supabase.storage
        .from(asset.bucket)
        .createSignedUrl(asset.path, 15 * 60);

      return {
        ...attachment,
        asset,
        downloadUrl: data?.signedUrl ?? null,
      };
    }),
  );

  const projects = access.flatMap((accessRow) => {
    const engagement = engagements.find(
      (item) => item.id === accessRow.engagement_id,
    );

    if (!engagement) {
      return [];
    }

    const projectDeliverables = deliverables.filter(
      (item) => item.engagement_id === engagement.id,
    );
    const projectDeliverableIds = new Set(
      projectDeliverables.map((item) => item.id),
    );

    return [
      {
        access: accessRow,
        engagement,
        deliverables: projectDeliverables,
        feedback: (feedbackResult.data ?? []).filter(
          (item) => item.engagement_id === engagement.id,
        ),
        files: portalFiles
          .filter(
            (item) =>
              (item.entity_type === "engagement" &&
                item.entity_id === engagement.id) ||
              (item.entity_type === "deliverable" &&
                projectDeliverableIds.has(item.entity_id)),
          )
          .map((item) => item),
        milestones: (milestoneResult.data ?? []).filter(
          (item) => item.engagement_id === engagement.id,
        ),
      },
    ];
  });

  return {
    demo: false,
    notifications: notifications ?? [],
    profile,
    projects,
  };
}

export async function getPortalProject(id: string) {
  const dashboard = await getPortalDashboard();

  return {
    ...dashboard,
    project:
      dashboard.projects.find((item) => item.engagement.id === id) ?? null,
  };
}
