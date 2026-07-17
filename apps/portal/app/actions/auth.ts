"use server";

import { loginSchema } from "@repo/domain";
import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  return value.startsWith("//") ? "/" : value;
}

export async function signIn(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const returnPath = safeReturnPath(formData.get("next"));

  if (!result.success) {
    redirect(
      `/login?error=${encodeURIComponent("Check your email address and password.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("Sign in failed. Check your invitation and account details.")}`,
    );
  }

  redirect(returnPath);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
