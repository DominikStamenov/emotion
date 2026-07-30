import { redirect } from "next/navigation";
import Link from "next/link";

import { verifyMfa } from "../../actions/auth";
import { createClient } from "../../../lib/supabase/server";
import styles from "../page.module.css";

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <Link href="/" className={styles.brand}>
          <span>e</span> eMotion
        </Link>
        <div>
          <span className={styles.eyebrow}>Multi-factor authentication</span>
          <h1>Još jedna provjera prije ulaska.</h1>
        </div>
        <small>eMotion Agency OS · protected session</small>
      </section>

      <section className={styles.formSide}>
        <form action={verifyMfa} className={styles.form}>
          <span className={styles.eyebrow}>Authenticator app</span>
          <h2>Potvrdi sigurnosni kod.</h2>
          <p>
            Unesi aktualni šesteroznamenkasti kod iz authenticator aplikacije.
          </p>

          {params.error ? (
            <div className={styles.error} role="alert">
              {params.error}
            </div>
          ) : null}

          <label>
            Jednokratni kod
            <input
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
              autoFocus
            />
          </label>
          <input type="hidden" name="next" value={params.next || "/"} />
          <button type="submit">
            Potvrdi kod <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
