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
      `/login?error=${encodeURIComponent("Provjeri e-mail adresu i lozinku.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("Prijava nije uspjela. Provjeri podatke ili status računa.")}`,
    );
  }

  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assuranceError) {
    await supabase.auth.signOut();
    redirect(
      `/login?error=${encodeURIComponent("Nije moguće provjeriti MFA status računa.")}`,
    );
  }

  if (assurance.currentLevel === "aal1" && assurance.nextLevel === "aal2") {
    redirect(`/login/mfa?next=${encodeURIComponent(returnPath)}`);
  }

  redirect(returnPath);
}

export async function verifyMfa(formData: FormData) {
  const code = formData.get("code");
  const returnPath = safeReturnPath(formData.get("next"));

  if (typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
    redirect(
      `/login/mfa?error=${encodeURIComponent("Unesi važeći šesteroznamenkasti kod.")}&next=${encodeURIComponent(returnPath)}`,
    );
  }

  const supabase = await createClient();
  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((item) => item.status === "verified");

  if (factorsError || !factor) {
    redirect(
      `/login?error=${encodeURIComponent("MFA faktor nije dostupan. Prijavi se ponovno.")}`,
    );
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: code.trim(),
  });

  if (error) {
    redirect(
      `/login/mfa?error=${encodeURIComponent("Kod nije prihvaćen. Pokušaj ponovno.")}&next=${encodeURIComponent(returnPath)}`,
    );
  }

  redirect(returnPath);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
