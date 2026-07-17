"use server";

import { portalFeedbackSchema } from "@repo/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPublicSupabaseConfig } from "../../lib/supabase/config";
import { createClient } from "../../lib/supabase/server";

export async function submitFeedback(formData: FormData) {
  const result = portalFeedbackSchema.safeParse({
    body: formData.get("body"),
    decision: formData.get("decision") || "comment",
    deliverableId: formData.get("deliverableId"),
    engagementId: formData.get("engagementId"),
  });

  const fallbackEngagementId = formData.get("engagementId");
  const returnPath =
    typeof fallbackEngagementId === "string"
      ? `/projects/${fallbackEngagementId}`
      : "/";

  if (!result.success) {
    redirect(`${returnPath}?error=Please%20enter%20valid%20feedback.`);
  }

  if (!getPublicSupabaseConfig()) {
    redirect(`${returnPath}?demo=Feedback%20is%20disabled%20in%20demo%20mode.`);
  }

  const supabase = await createClient();
  const { data: deliverable } = await supabase
    .from("deliverables")
    .select("id, engagement_id")
    .eq("id", result.data.deliverableId)
    .eq("engagement_id", result.data.engagementId)
    .single();

  if (!deliverable) {
    redirect(`${returnPath}?error=Deliverable%20is%20not%20available.`);
  }

  const { error } = await supabase.rpc("submit_deliverable_feedback", {
    p_body: result.data.body,
    p_decision: result.data.decision,
    p_deliverable_id: result.data.deliverableId,
  });

  if (error) {
    redirect(`${returnPath}?error=Feedback%20could%20not%20be%20saved.`);
  }

  revalidatePath(returnPath);
  redirect(`${returnPath}?success=Feedback%20saved.`);
}
