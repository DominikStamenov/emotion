import {
  publicSupabaseConfigSchema,
  type PublicSupabaseConfig,
} from "@repo/domain";

export function getPublicSupabaseConfig(): PublicSupabaseConfig | null {
  const result = publicSupabaseConfigSchema.safeParse({
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  return result.success ? result.data : null;
}
