import type { Database } from "@repo/database";
import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "./config";

export function createAdminClient() {
  const config = getPublicSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!config || !secretKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient<Database>(config.url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
