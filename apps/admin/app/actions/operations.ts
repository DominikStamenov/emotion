"use server";

import {
  createDeliverableSchema,
  createEngagementSchema,
  createProposalSchema,
  createTaskSchema,
} from "@repo/domain";
import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";

function refreshOperations() {
  revalidatePath("/operations");
  revalidatePath("/");
}

export async function createTask(formData: FormData) {
  const profile = await requireAdminProfile();
  const parsed = createTaskSchema.safeParse({
    dueAt: formData.get("dueAt"),
    opportunityId: formData.get("opportunityId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    assignee_id: profile.id,
    created_by: profile.id,
    due_at: parsed.data.dueAt
      ? new Date(parsed.data.dueAt).toISOString()
      : null,
    opportunity_id: parsed.data.opportunityId || null,
    title: parsed.data.title,
  });
  if (error) throw new Error("Zadatak nije spremljen: " + error.message);
  refreshOperations();
}

export async function createProposal(formData: FormData) {
  const profile = await requireAdminProfile();
  const parsed = createProposalSchema.safeParse({
    amount: formData.get("amount"),
    opportunityId: formData.get("opportunityId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("proposals")
    .select("version")
    .eq("opportunity_id", parsed.data.opportunityId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("proposals").insert({
    amount: parsed.data.amount ?? null,
    content: { sections: [] },
    created_by: profile.id,
    opportunity_id: parsed.data.opportunityId,
    title: parsed.data.title,
    updated_by: profile.id,
    version: (latest?.version || 0) + 1,
  });
  if (error) throw new Error("Ponuda nije spremljena: " + error.message);
  refreshOperations();
}

export async function createEngagement(formData: FormData) {
  const profile = await requireAdminProfile();
  const parsed = createEngagementSchema.safeParse({
    budget: formData.get("budget"),
    opportunityId: formData.get("opportunityId"),
    summary: formData.get("summary") || "",
    targetEndDate: formData.get("targetEndDate"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase.from("engagements").insert({
    budget: parsed.data.budget ?? null,
    opportunity_id: parsed.data.opportunityId || null,
    owner_id: profile.id,
    summary: parsed.data.summary || null,
    target_end_date: parsed.data.targetEndDate || null,
    title: parsed.data.title,
  });
  if (error) throw new Error("Angažman nije spremljen: " + error.message);
  refreshOperations();
}

export async function createDeliverable(formData: FormData) {
  const profile = await requireAdminProfile();
  const parsed = createDeliverableSchema.safeParse({
    description: formData.get("description") || "",
    dueAt: formData.get("dueAt"),
    engagementId: formData.get("engagementId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("deliverables")
    .select("id", { count: "exact", head: true })
    .eq("engagement_id", parsed.data.engagementId);
  const { error } = await supabase.from("deliverables").insert({
    description: parsed.data.description || null,
    due_at: parsed.data.dueAt
      ? new Date(parsed.data.dueAt).toISOString()
      : null,
    engagement_id: parsed.data.engagementId,
    owner_id: profile.id,
    position: count || 0,
    title: parsed.data.title,
  });
  if (error) throw new Error("Isporuka nije spremljena: " + error.message);
  refreshOperations();
}
