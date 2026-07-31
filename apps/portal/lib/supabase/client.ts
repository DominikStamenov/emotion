import type { Database } from "@repo/database";
import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseConfig } from "./config";

export function createClient() {
  const config = getPublicSupabaseConfig();

  if (!config) {
    throw new Error("Supabase public configuration is missing or invalid.");
  }

  return createBrowserClient<Database>(config.url, config.publishableKey);
}
