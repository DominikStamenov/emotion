import { Button, Field, Input } from "@repo/ui";
import { redirect } from "next/navigation";

import { signIn } from "../actions/auth";
import { getPublicSupabaseConfig } from "../../lib/supabase/config";
import styles from "./login.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (!getPublicSupabaseConfig()) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <a href="https://emotion.com" className={styles.brand}>
          <span>e</span> eMotion
        </a>
        <div>
          <p>Client Portal</p>
          <h1>Your work. Your feedback. One shared rhythm.</h1>
        </div>
        <small>Private workspace · emotion.com</small>
      </section>

      <section className={styles.formSide}>
        <form action={signIn} className={styles.form}>
          <p>Secure sign in</p>
          <h2>Welcome back.</h2>
          <span>Use the account included in your eMotion invitation.</span>

          {params.error ? (
            <div className={styles.error} role="alert">
              {params.error}
            </div>
          ) : null}

          <Field htmlFor="email" label="Email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </Field>
          <Field htmlFor="password" label="Password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </Field>
          <input type="hidden" name="next" value={params.next || "/"} />
          <Button type="submit" size="large" fullWidth>
            Sign in <span aria-hidden="true">→</span>
          </Button>
        </form>
      </section>
    </main>
  );
}
