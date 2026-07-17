import type { Tables } from "@repo/database";

import { AdminShell } from "../components/admin-shell";
import { getAdminContext } from "../lib/auth";
import { createClient } from "../lib/supabase/server";
import styles from "./page.module.css";

function SetupState() {
  return (
    <main className={styles.setup}>
      <div className={styles.setupCard}>
        <span className={styles.eyebrow}>eMotion agency OS</span>
        <h1>Platforma je spremna za povezivanje.</h1>
        <p>
          Aplikacijski sloj, ovlasti i baza podataka su definirani. Za
          aktivaciju prijave i živih podataka dodaj Supabase vrijednosti iz{" "}
          <code>.env.example</code> u lokalni <code>.env.local</code>.
        </p>
        <ol>
          <li>Pokreni migracije iz mape supabase/migrations.</li>
          <li>Kreiraj prvog korisnika u Supabase Authu.</li>
          <li>
            Dodijeli mu ulogu owner, postavi active na true i account_type na
            staff.
          </li>
        </ol>
        <div className={styles.setupStatus}>
          <span /> Sigurno stanje: pristup podacima nije otvoren
        </div>
      </div>
    </main>
  );
}

function InactiveState({
  profile,
  client = false,
}: {
  profile: Tables<"profiles">;
  client?: boolean;
}) {
  return (
    <main className={styles.setup}>
      <div className={styles.setupCard}>
        <span className={styles.eyebrow}>
          {client ? "Client Portal račun" : "Pristup na čekanju"}
        </span>
        <h1>
          {client
            ? "Ovaj račun nije interni eMotion član."
            : "Račun još nije aktiviran."}
        </h1>
        <p>
          {client
            ? `Prijava za ${profile.display_name || "ovog korisnika"} pripada sigurnom klijentskom prostoru i nema pristup CMS-u, CRM-u ni internim podacima.`
            : `Prijava za ${profile.display_name || "ovog korisnika"} postoji, ali administrator mora potvrditi ulogu i pristup prije otvaranja podataka.`}
        </p>
      </div>
    </main>
  );
}

async function getDashboardData() {
  const supabase = await createClient();
  const [inquiries, drafts, opportunities, tasks] = await Promise.all([
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("opportunities")
      .select("estimated_value, currency, stage")
      .not("stage", "in", '("won","lost")'),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
  ]);

  const pipelineValue = (opportunities.data || []).reduce(
    (total, item) => total + (item.estimated_value || 0),
    0,
  );

  return {
    drafts: drafts.count || 0,
    inquiries: inquiries.count || 0,
    openTasks: tasks.count || 0,
    pipelineCount: opportunities.data?.length || 0,
    pipelineValue,
  };
}

export default async function Home() {
  const context = await getAdminContext();

  if (context.state === "setup") {
    return <SetupState />;
  }

  if (context.state === "inactive" || context.state === "client") {
    return (
      <InactiveState
        profile={context.profile}
        client={context.state === "client"}
      />
    );
  }

  const data = await getDashboardData();

  return (
    <AdminShell profile={context.profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Operativni pregled</span>
          <h1>Dobar dan, {context.profile.display_name || "eMotion"}.</h1>
          <p>Sadržaj, odnosi i sljedeće aktivnosti na jednom mjestu.</p>
        </div>
        <span className={styles.live}>Sustav aktivan</span>
      </header>

      <section className={styles.metrics} aria-label="Ključni pokazatelji">
        <article className={styles.metricAccent}>
          <span>Novi upiti</span>
          <strong>{data.inquiries.toString().padStart(2, "0")}</strong>
          <small>za kvalifikaciju</small>
        </article>
        <article>
          <span>Otvoren pipeline</span>
          <strong>€{data.pipelineValue.toLocaleString("hr-HR")}</strong>
          <small>{data.pipelineCount} prilika</small>
        </article>
        <article>
          <span>Skice sadržaja</span>
          <strong>{data.drafts.toString().padStart(2, "0")}</strong>
          <small>čeka uređivanje</small>
        </article>
        <article>
          <span>Aktivni zadaci</span>
          <strong>{data.openTasks.toString().padStart(2, "0")}</strong>
          <small>u radu</small>
        </article>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Conversion flow</span>
              <h2>Prodajni pipeline</h2>
            </div>
            <a href="/crm">Otvori CRM →</a>
          </div>
          <div className={styles.emptyChart}>
            <span className={styles.chartLine} />
            <p>Pipeline se puni iz kontakt obrasca i AI handoffa.</p>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Today</span>
              <h2>Prioriteti</h2>
            </div>
          </div>
          <ul className={styles.priorities}>
            <li>
              <span>01</span>
              <div>
                <strong>Pregledaj nove upite</strong>
                <small>{data.inquiries} čeka vlasnika</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Dovrši uredničke skice</strong>
                <small>{data.drafts} zapisa nije objavljeno</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Zatvori sljedeće akcije</strong>
                <small>{data.openTasks} aktivnih zadataka</small>
              </div>
            </li>
          </ul>
        </article>
      </section>
    </AdminShell>
  );
}
