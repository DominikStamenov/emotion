import { redirect } from "next/navigation";

import { signIn } from "../actions/auth";
import { getPublicSupabaseConfig } from "../../lib/supabase/config";
import styles from "./page.module.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (!getPublicSupabaseConfig()) {
    redirect("/");
  }

  const params = await searchParams;
  const publicSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const publicSiteHost = new URL(publicSiteUrl).host;

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <a href={publicSiteUrl} className={styles.brand}>
          <span>e</span> eMotion
        </a>
        <div>
          <span className={styles.eyebrow}>Private workspace</span>
          <h1>Ideje, odnosi i izvedba. Jedan sustav.</h1>
        </div>
        <small>{publicSiteHost} · agency operating system</small>
      </section>

      <section className={styles.formSide}>
        <form action={signIn} className={styles.form}>
          <span className={styles.eyebrow}>Sigurna prijava</span>
          <h2>Dobrodošao natrag.</h2>
          <p>Pristup je ograničen na aktivne eMotion članove.</p>

          {params.error ? (
            <div className={styles.error} role="alert">
              {params.error}
            </div>
          ) : null}

          <label>
            E-mail
            <input type="email" name="email" autoComplete="email" required />
          </label>
          <label>
            Lozinka
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>
          <input type="hidden" name="next" value={params.next || "/"} />
          <button type="submit">
            Prijavi se <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
