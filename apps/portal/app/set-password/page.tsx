import { Button, Field, Input } from "@repo/ui";
import { redirect } from "next/navigation";

import { setPassword } from "../actions/auth";
import { createClient } from "../../lib/supabase/server";
import styles from "../login/login.module.css";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect(
      `/login?error=${encodeURIComponent("Open the newest eMotion invitation to set your password.")}`,
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <span className={styles.brand}>
          <span aria-hidden="true" /> eMotion
        </span>
        <div>
          <p>Client Portal</p>
          <h1>One last step. Then the project is yours.</h1>
        </div>
        <small>Private workspace · secure account setup</small>
      </section>

      <section className={styles.formSide}>
        <form action={setPassword} className={styles.form}>
          <p>Accept invitation</p>
          <h2>Set your password.</h2>
          <span>
            Use at least 8 characters. You will use this email and password for
            future Portal sign-ins.
          </span>

          {params.error ? (
            <div className={styles.error} role="alert">
              {params.error}
            </div>
          ) : null}

          <Field htmlFor="password" label="New password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              autoFocus
            />
          </Field>
          <Field htmlFor="confirmation" label="Repeat password">
            <Input
              id="confirmation"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Button type="submit" size="large" fullWidth>
            Save password <span aria-hidden="true">→</span>
          </Button>
        </form>
      </section>
    </main>
  );
}
