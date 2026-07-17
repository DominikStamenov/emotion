import type { Tables } from "@repo/database";
import { redirect } from "next/navigation";

import { getPublicSupabaseConfig } from "./supabase/config";
import { createClient } from "./supabase/server";

type AdminContext =
  | { state: "setup" }
  | {
      profile: Tables<"profiles">;
      state: "client" | "inactive" | "ready";
    };

export async function getAdminContext(): Promise<AdminContext> {
  if (!getPublicSupabaseConfig()) {
    return { state: "setup" };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    redirect("/login?error=Profil%20nije%20dostupan.");
  }

  return {
    profile,
    state:
      profile.account_type !== "staff"
        ? "client"
        : profile.active
          ? "ready"
          : "inactive",
  };
}

export async function requireAdminProfile() {
  const context = await getAdminContext();

  if (context.state !== "ready") {
    redirect("/");
  }

  return context.profile;
}
