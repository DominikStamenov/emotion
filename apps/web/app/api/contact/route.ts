import type { Json } from "@repo/database";
import {
  contactInquirySchema,
  getForwardedClientAddress,
  hasInvalidRequestOrigin,
  hasOversizedRequestBody,
  type ContactInquiry,
} from "@repo/domain";
import {
  renderContactConfirmation,
  renderContactNotification,
  type RenderedEmail,
} from "@repo/email";
import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { createAdminClient } from "../../../lib/supabase/admin";

export const runtime = "nodejs";
const AI_SESSION_COOKIE = "emotion_ai_session";

function hashValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function cleanAttribution(attribution: ContactInquiry["attribution"]): Json {
  return Object.fromEntries(
    Object.entries(attribution).filter((entry) => Boolean(entry[1])),
  ) as Json;
}

async function sendTrackedEmail({
  inquiryId,
  recipient,
  template,
  templateKey,
}: {
  inquiryId: string;
  recipient: string;
  template: RenderedEmail;
  templateKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const hashSecret = process.env.IP_HASH_SECRET;

  if (!apiKey || !from || !hashSecret) {
    return;
  }

  const supabase = createAdminClient();
  const { data: delivery } = await supabase
    .from("email_deliveries")
    .insert({
      inquiry_id: inquiryId,
      recipient_hash: hashValue(recipient.toLowerCase(), hashSecret),
      status: "queued",
      template_key: templateKey,
    })
    .select("id")
    .single();

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    html: template.html,
    subject: template.subject,
    text: template.text,
    to: recipient,
  });

  if (delivery) {
    await supabase
      .from("email_deliveries")
      .update({
        failed_at: error ? new Date().toISOString() : null,
        metadata: error ? { error: error.message } : {},
        provider_message_id: data?.id || null,
        sent_at: error ? null : new Date().toISOString(),
        status: error ? "failed" : "sent",
      })
      .eq("id", delivery.id);
  }
}

export async function POST(request: NextRequest) {
  if (hasOversizedRequestBody(request, 50_000)) {
    return NextResponse.json(
      { error: "Request is too large." },
      { status: 413 },
    );
  }

  if (hasInvalidRequestOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const result = contactInquirySchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Please review the required fields." },
      { status: 422 },
    );
  }

  if (result.data.website) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const hashSecret = process.env.IP_HASH_SECRET;

  if (!hashSecret || hashSecret.length < 32) {
    return NextResponse.json(
      { error: "Contact service is not configured." },
      { status: 503 },
    );
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 500) || "";
  const ipHash = hashValue(getForwardedClientAddress(request), hashSecret);
  const fingerprint = hashValue(ipHash + userAgent.slice(0, 160), hashSecret);
  const requestId = randomUUID();

  try {
    const supabase = createAdminClient();
    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "consume_rate_limit",
      {
        p_action: "contact_inquiry",
        p_key_hash: fingerprint,
        p_max_requests: 5,
        p_window_seconds: 3600,
      },
    );

    if (rateLimitError) {
      throw rateLimitError;
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const inquiry = result.data;
    const { data: inquiryId, error: inquiryError } = await supabase.rpc(
      "submit_public_inquiry",
      {
        p_attribution: cleanAttribution(inquiry.attribution),
        p_budget_range: inquiry.budgetRange || "",
        p_company: inquiry.company || "",
        p_email: inquiry.email,
        p_ip_hash: ipHash,
        p_marketing_consent: inquiry.marketingConsent,
        p_message: inquiry.message,
        p_metadata: { requestId },
        p_name: inquiry.name,
        p_requested_services: inquiry.requestedServices,
        p_timeframe: inquiry.timeframe || "",
        p_user_agent: userAgent,
      },
    );

    if (inquiryError || !inquiryId) {
      throw inquiryError || new Error("Inquiry was not persisted.");
    }

    if (inquiry.conversationId) {
      const aiSession = request.cookies.get(AI_SESSION_COOKIE)?.value;

      if (aiSession) {
        const visitorSessionHash = hashValue(aiSession, hashSecret);
        await supabase
          .from("ai_conversations")
          .update({
            handoff_requested_at: new Date().toISOString(),
            inquiry_id: inquiryId,
            status: "handoff_requested",
          })
          .eq("id", inquiry.conversationId)
          .eq("visitor_session_hash", visitorSessionHash);
      }
    }

    const notificationRecipient =
      process.env.CONTACT_NOTIFICATION_EMAIL || "info@emotion.com";

    await Promise.allSettled([
      sendTrackedEmail({
        inquiryId,
        recipient: notificationRecipient,
        template: renderContactNotification(inquiry),
        templateKey: "contact_notification",
      }),
      sendTrackedEmail({
        inquiryId,
        recipient: inquiry.email,
        template: renderContactConfirmation(inquiry),
        templateKey: "contact_confirmation",
      }),
    ]);

    return NextResponse.json({ ok: true, requestId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We could not save your brief. Please email info@emotion.com." },
      { status: 503 },
    );
  }
}
