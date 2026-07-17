import type { Database } from "@repo/database";
import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "./config";

export function createPublicClient() {
  const config = getPublicSupabaseConfig();

  if (!config) {
    return null;
  }

  return createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
