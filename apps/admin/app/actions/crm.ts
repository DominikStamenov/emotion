"use server";

import { opportunityStageSchema } from "@repo/domain";
import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";

export async function updateOpportunityStage(formData: FormData) {
  await requireAdminProfile();
  const opportunityId = formData.get("opportunityId");
  const stage = opportunityStageSchema.safeParse(formData.get("stage"));

  if (typeof opportunityId !== "string" || !stage.success) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("opportunities")
    .update({ stage: stage.data })
    .eq("id", opportunityId);
  revalidatePath("/crm");
}

export async function assignInquiryToSelf(formData: FormData) {
  const profile = await requireAdminProfile();
  const inquiryId = formData.get("inquiryId");

  if (typeof inquiryId !== "string") {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("inquiries")
    .update({ assigned_to: profile.id, status: "reviewing" })
    .eq("id", inquiryId);
  revalidatePath("/inbox");
  revalidatePath("/");
}

export async function qualifyInquiry(formData: FormData) {
  const profile = await requireAdminProfile();
  const inquiryId = formData.get("inquiryId");

  if (typeof inquiryId !== "string") {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("qualify_inquiry", {
    p_inquiry_id: inquiryId,
    p_owner_id: profile.id,
  });

  if (error) {
    throw new Error("Upit nije bilo moguće kvalificirati: " + error.message);
  }

  revalidatePath("/inbox");
  revalidatePath("/crm");
  revalidatePath("/");
}
