import { webEventSchema } from "@repo/domain";
import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "../../../lib/supabase/admin";

function hashValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(request: NextRequest) {
  if (request.cookies.get("emotion_consent")?.value !== "analytics") {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const secret = process.env.IP_HASH_SECRET;
  const session = request.cookies.get("emotion_analytics_session")?.value;
  if (!secret || !session) {
    return NextResponse.json(
      { error: "Analytics session missing." },
      { status: 400 },
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

  const parsed = webEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event." }, { status: 422 });
  }

  const sessionHash = hashValue(session, secret);

  try {
    const supabase = createAdminClient();
    const { data: allowed } = await supabase.rpc("consume_rate_limit", {
      p_action: "web_event",
      p_key_hash: sessionHash,
      p_max_requests: 120,
      p_window_seconds: 3600,
    });

    if (!allowed) {
      return NextResponse.json({ ok: true }, { status: 202 });
    }

    await supabase.from("web_events").insert({
      event_name: parsed.data.eventName,
      path: parsed.data.path,
      properties: parsed.data.properties,
      referrer: parsed.data.referrer || null,
      visitor_session_hash: sessionHash,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Event was not stored." },
      { status: 503 },
    );
  }
}
