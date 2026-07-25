import {
  consentPreferenceSchema,
  hasInvalidRequestOrigin,
  hasOversizedRequestBody,
} from "@repo/domain";
import { createHmac, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "../../../lib/supabase/admin";

const CONSENT_COOKIE = "emotion_consent";
const ANALYTICS_SESSION_COOKIE = "emotion_analytics_session";

function hashValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(request: NextRequest) {
  if (hasOversizedRequestBody(request, 5_000)) {
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

  const secret = process.env.IP_HASH_SECRET;

  if (!secret || secret.length < 32) {
    return NextResponse.json(
      { error: "Consent service unavailable." },
      { status: 503 },
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

  const parsed = consentPreferenceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preference." }, { status: 422 });
  }

  const session =
    request.cookies.get(ANALYTICS_SESSION_COOKIE)?.value ||
    randomBytes(24).toString("hex");
  const sessionHash = hashValue(session, secret);

  try {
    const supabase = createAdminClient();
    await supabase.from("consent_records").insert({
      consent_type: "analytics",
      granted: parsed.data.preference === "analytics",
      metadata: { preferenceVersion: 1 },
      user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
      visitor_session_hash: sessionHash,
    });
  } catch {
    return NextResponse.json(
      { error: "Preference was not saved." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONSENT_COOKIE, parsed.data.preference, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  response.cookies.set(ANALYTICS_SESSION_COOKIE, session, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}
