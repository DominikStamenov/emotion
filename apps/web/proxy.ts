import type { Database } from "@repo/database";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicSupabaseConfig } from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  const config = getPublicSupabaseConfig();

  if (!config) {
    return NextResponse.next();
  }

  const supabase = createClient<Database>(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: redirect } = await supabase
    .from("redirects")
    .select("target_path, status_code")
    .eq("source_path", request.nextUrl.pathname)
    .eq("active", true)
    .maybeSingle();

  if (!redirect) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(redirect.target_path, request.url),
    redirect.status_code,
  );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
