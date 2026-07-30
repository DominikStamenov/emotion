"use client";

import { Button, Field, Input } from "@repo/ui";
import Image from "next/image";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "../../lib/supabase/client";
import styles from "./security-settings.module.css";

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

function qrSource(value: string) {
  return value.startsWith("data:")
    ? value
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;
}

export function SecuritySettings({ email }: { email: string }) {
  const enrollmentRef = useRef<HTMLDivElement>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshMfa = useCallback(async () => {
    const supabase = createClient();
    const { data, error: factorsError } = await supabase.auth.mfa.listFactors();

    if (factorsError) {
      setError("MFA status trenutno nije dostupan.");
      return;
    }

    const verified = data.totp.find((factor) => factor.status === "verified");
    setFactorId(verified?.id || null);
    setMfaEnabled(Boolean(verified));
  }, []);

  useEffect(() => {
    void refreshMfa();
  }, [refreshMfa]);

  useEffect(() => {
    if (!enrollment) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      enrollmentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enrollment]);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(formElement);
    const currentPassword = String(formData.get("currentPassword") || "");
    const nextPassword = String(formData.get("nextPassword") || "");
    const confirmation = String(formData.get("confirmation") || "");

    if (nextPassword.length < 12) {
      setError("Nova lozinka mora imati najmanje 12 znakova.");
      setBusy(false);
      return;
    }

    if (nextPassword !== confirmation) {
      setError("Nova lozinka i potvrda nisu jednake.");
      setBusy(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (reauthError) {
        setError("Trenutačna lozinka nije ispravna.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: nextPassword,
      });

      if (updateError) {
        setError("Lozinku nije moguće promijeniti. Pokušaj ponovno.");
        return;
      }

      formElement.reset();
      setMessage("Lozinka je uspješno promijenjena.");
    } catch {
      setError(
        "Veza sa servisom za prijavu je prekinuta. Osvježi stranicu i pokušaj ponovno.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function startEnrollment() {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        setError("MFA status trenutno nije dostupan. Pokušaj ponovno.");
        return;
      }

      const abandonedFactors = factors.all.filter(
        (factor) =>
          factor.factor_type === "totp" && factor.status === "unverified",
      );
      const cleanupResults = await Promise.all(
        abandonedFactors.map((factor) =>
          supabase.auth.mfa.unenroll({ factorId: factor.id }),
        ),
      );

      if (cleanupResults.some((result) => result.error)) {
        setError(
          "Prethodni MFA pokušaj nije moguće očistiti. Osvježi stranicu.",
        );
        return;
      }

      const { data, error: enrollmentError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "eMotion Admin",
      });

      if (enrollmentError || !data.totp) {
        setError("MFA postavljanje nije moguće pokrenuti.");
        return;
      }

      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setMessage("QR kod je spreman. Skeniraj ga i unesi kod za potvrdu.");
    } catch {
      setError("Veza sa servisom za prijavu je prekinuta. Pokušaj ponovno.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enrollment) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    const code = String(
      new FormData(event.currentTarget).get("verificationCode") || "",
    ).trim();

    if (!/^\d{6}$/.test(code)) {
      setError("Unesi aktualni šesteroznamenkasti kod.");
      setBusy(false);
      return;
    }

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.factorId,
      code,
    });

    if (verifyError) {
      setError("Kod nije prihvaćen. Provjeri vrijeme i pokušaj ponovno.");
      setBusy(false);
      return;
    }

    setEnrollment(null);
    setMessage("MFA je aktiviran. Buduće prijave zahtijevat će TOTP kod.");
    await refreshMfa();
    setBusy(false);
  }

  async function cancelEnrollment() {
    if (!enrollment) {
      return;
    }

    setBusy(true);
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    setEnrollment(null);
    setBusy(false);
  }

  async function disableMfa() {
    if (!factorId) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (unenrollError) {
      setError(
        "MFA nije moguće isključiti bez aktualne AAL2 sesije. Prijavi se ponovno.",
      );
      setBusy(false);
      return;
    }

    setMessage("MFA faktor je uklonjen.");
    await refreshMfa();
    setBusy(false);
  }

  return (
    <section className={styles.security}>
      <div className={styles.header}>
        <div>
          <h2>Sigurnost vlasničkog računa</h2>
          <p className={styles.description}>{email}</p>
        </div>
        <span
          className={`${styles.status} ${mfaEnabled ? styles.enabled : ""}`}
        >
          {mfaEnabled ? "MFA aktivan" : "MFA nije postavljen"}
        </span>
      </div>

      <div className={styles.content}>
        <article className={styles.card}>
          <div>
            <h3>Promjena lozinke</h3>
            <p className={styles.hint}>
              Potvrdi trenutačnu lozinku prije postavljanja nove.
            </p>
          </div>
          <form className={styles.form} onSubmit={changePassword}>
            <Field htmlFor="current-password" label="Trenutačna lozinka">
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field
              htmlFor="next-password"
              label="Nova lozinka"
              hint="Najmanje 12 znakova; koristi jedinstvenu lozinku."
            >
              <Input
                id="next-password"
                name="nextPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </Field>
            <Field htmlFor="password-confirmation" label="Potvrdi novu lozinku">
              <Input
                id="password-confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </Field>
            <Button type="submit" loading={busy}>
              Promijeni lozinku
            </Button>
          </form>
        </article>

        <article className={styles.card}>
          <div>
            <h3>Authenticator MFA</h3>
            <p className={styles.hint}>
              TOTP radi s 1Passwordom, Apple Passwords, Google Authenticatorom i
              drugim kompatibilnim aplikacijama.
            </p>
          </div>

          {enrollment ? (
            <div ref={enrollmentRef} className={styles.enrollment}>
              <Image
                className={styles.qr}
                src={qrSource(enrollment.qrCode)}
                alt="QR kod za eMotion Admin MFA"
                width={196}
                height={196}
                unoptimized
              />
              <p className={styles.hint}>
                Skeniraj QR kod ili ručno unesi ovaj ključ:
              </p>
              <code className={styles.secret}>{enrollment.secret}</code>
              <form className={styles.form} onSubmit={verifyEnrollment}>
                <Field
                  htmlFor="verification-code"
                  label="Kod za potvrdu"
                  hint="Točno 6 znamenki iz authenticator aplikacije."
                >
                  <Input
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                    }}
                    required
                  />
                </Field>
                <div className={styles.actions}>
                  <Button type="submit" loading={busy}>
                    Aktiviraj MFA
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={cancelEnrollment}
                    disabled={busy}
                  >
                    Odustani
                  </Button>
                </div>
              </form>
            </div>
          ) : mfaEnabled ? (
            <div className={styles.enrollment}>
              <p className={styles.message}>
                Ovaj račun ima potvrđen TOTP faktor. Svaka nova prijava mora
                dosegnuti AAL2.
              </p>
              <Button
                type="button"
                variant="danger"
                onClick={disableMfa}
                loading={busy}
              >
                Ukloni MFA faktor
              </Button>
            </div>
          ) : (
            <div className={styles.enrollment}>
              <p className={styles.hint}>
                Nakon aktivacije, lozinka sama više nije dovoljna za pristup
                poslovnim podacima.
              </p>
              <Button type="button" onClick={startEnrollment} loading={busy}>
                Postavi authenticator
              </Button>
            </div>
          )}
        </article>
      </div>

      {message ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
