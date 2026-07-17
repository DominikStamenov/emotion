import type { Database } from "@repo/database";
import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "./config";

export function createAdminClient() {
  const publicConfig = getPublicSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!publicConfig || !secretKey || secretKey.length < 20) {
    throw new Error("Supabase server configuration is missing or invalid.");
  }

  return createClient<Database>(publicConfig.url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
