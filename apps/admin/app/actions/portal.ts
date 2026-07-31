"use server";

import { createMilestoneSchema, portalInviteSchema } from "@repo/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminProfile } from "../../lib/auth";
import { createAdminClient } from "../../lib/supabase/admin";
import { createClient } from "../../lib/supabase/server";

function refreshPortalOperations() {
  revalidatePath("/clients");
  revalidatePath("/operations");
}

async function requirePortalAdmin() {
  const profile = await requireAdminProfile();

  if (!["owner", "admin"].includes(profile.role)) {
    throw new Error("Samo owner ili admin mogu upravljati Client Portalom.");
  }

  return profile;
}

export async function invitePortalClient(formData: FormData) {
  await requirePortalAdmin();
  const parsed = portalInviteSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    engagementId: formData.get("engagementId"),
    role: formData.get("role") || "client",
  });

  if (!parsed.success) {
    throw new Error("Podaci za Portal pozivnicu nisu valjani.");
  }

  const admin = createAdminClient();
  const { data: listedUsers, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    throw new Error("Korisnike nije moguće provjeriti: " + listError.message);
  }

  let user = listedUsers.users.find(
    (candidate) => candidate.email?.toLowerCase() === parsed.data.email,
  );

  if (!user) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(
      parsed.data.email,
      {
        data: { display_name: parsed.data.displayName },
        redirectTo:
          process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002",
      },
    );

    if (error || !data.user) {
      throw new Error("Pozivnica nije poslana: " + (error?.message || "error"));
    }

    user = data.user;
  }

  const supabase = await createClient();
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(
      "Postojeći profil nije moguće provjeriti: " +
        existingProfileError.message,
    );
  }

  if (existingProfile?.account_type === "staff") {
    throw new Error(
      "Interni eMotion račun ne može se pretvoriti u klijentski račun.",
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      account_type: "client",
      active: true,
      display_name: parsed.data.displayName,
    })
    .eq("id", user.id);

  if (profileError) {
    throw new Error("Klijentski profil nije ažuriran: " + profileError.message);
  }

  const { error: accessError } = await supabase
    .from("client_portal_access")
    .upsert(
      {
        access_role: parsed.data.role,
        active: true,
        engagement_id: parsed.data.engagementId,
        user_id: user.id,
      },
      { onConflict: "engagement_id,user_id" },
    );

  if (accessError) {
    throw new Error("Portal pristup nije spremljen: " + accessError.message);
  }

  refreshPortalOperations();
}

export async function createMilestone(formData: FormData) {
  await requirePortalAdmin();
  const parsed = createMilestoneSchema.safeParse({
    description: formData.get("description") || "",
    dueAt: formData.get("dueAt"),
    engagementId: formData.get("engagementId"),
    startsAt: formData.get("startsAt"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    throw new Error("Milestone podaci nisu valjani.");
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("project_milestones")
    .select("id", { count: "exact", head: true })
    .eq("engagement_id", parsed.data.engagementId);
  const { error } = await supabase.from("project_milestones").insert({
    description: parsed.data.description || null,
    due_at: parsed.data.dueAt || null,
    engagement_id: parsed.data.engagementId,
    position: count || 0,
    starts_at: parsed.data.startsAt || null,
    title: parsed.data.title,
  });

  if (error) {
    throw new Error("Milestone nije spremljen: " + error.message);
  }

  refreshPortalOperations();
}

export async function openPortalPasswordSetup(formData: FormData) {
  await requirePortalAdmin();
  const userId = String(formData.get("userId") || "");

  if (!userId) {
    throw new Error("Klijentski račun nije odabran.");
  }

  const supabase = await createClient();
  const { data: access, error: accessError } = await supabase
    .from("client_portal_access")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (accessError || !access) {
    throw new Error("Aktivni Portal pristup nije pronađen.");
  }

  const admin = createAdminClient();
  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(userId);
  const email = userData.user?.email;

  if (userError || !email) {
    throw new Error("Email klijentskog računa nije pronađen.");
  }

  const portalUrl =
    process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002";
  const { data, error } = await admin.auth.admin.generateLink({
    email,
    options: { redirectTo: portalUrl },
    type: "recovery",
  });

  if (error || !data.properties?.action_link) {
    throw new Error(
      "Jednokratni link nije moguće kreirati: " +
        (error?.message || "unknown error"),
    );
  }

  redirect(data.properties.action_link);
}

export async function publishDeliverableForReview(formData: FormData) {
  await requirePortalAdmin();
  const deliverableId = String(formData.get("deliverableId") || "");

  if (!deliverableId) {
    return;
  }

  const supabase = await createClient();
  const { data: deliverable, error } = await supabase
    .from("deliverables")
    .update({ delivered_at: new Date().toISOString(), status: "review" })
    .eq("id", deliverableId)
    .select("id, title, engagement_id")
    .single();

  if (error || !deliverable) {
    throw new Error("Isporuka nije poslana na pregled.");
  }

  const { data: recipients } = await supabase
    .from("client_portal_access")
    .select("user_id")
    .eq("engagement_id", deliverable.engagement_id)
    .eq("active", true);

  if (recipients?.length) {
    const { error: notificationError } = await supabase
      .from("portal_notifications")
      .insert(
        recipients.map((recipient) => ({
          body: `${deliverable.title} is ready for your review and decision.`,
          engagement_id: deliverable.engagement_id,
          href: `/projects/${deliverable.engagement_id}`,
          notification_type: "review_ready",
          title: "New deliverable ready",
          user_id: recipient.user_id,
        })),
      );

    if (notificationError) {
      throw new Error("Portal obavijest nije spremljena.");
    }
  }

  refreshPortalOperations();
}

export async function resolvePortalFeedback(formData: FormData) {
  const profile = await requirePortalAdmin();
  const feedbackId = String(formData.get("feedbackId") || "");

  if (!feedbackId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("portal_feedback")
    .update({ resolved_at: new Date().toISOString(), resolved_by: profile.id })
    .eq("id", feedbackId);

  if (error) {
    throw new Error("Feedback nije zatvoren: " + error.message);
  }

  refreshPortalOperations();
}
