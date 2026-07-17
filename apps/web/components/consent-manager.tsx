"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./consent-manager.module.css";

type Preference = "analytics" | "necessary";

function readPreference(): Preference | null {
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("emotion_consent="))
    ?.split("=")[1];
  return value === "analytics" || value === "necessary" ? value : null;
}

export function ConsentManager() {
  const pathname = usePathname();
  const [error, setError] = useState("");
  const [preference, setPreference] = useState<Preference | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setPreference(readPreference());
  }, []);

  useEffect(() => {
    if (preference !== "analytics") return;

    void fetch("/api/events", {
      body: JSON.stringify({
        eventName: "page_view",
        path: pathname,
        referrer: document.referrer || undefined,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
      keepalive: true,
    });
  }, [pathname, preference]);

  async function savePreference(nextPreference: Preference) {
    setError("");

    if (nextPreference === "necessary") {
      document.cookie =
        "emotion_consent=necessary; Max-Age=15552000; Path=/; SameSite=Lax" +
        (window.location.protocol === "https:" ? "; Secure" : "");
      setPreference("necessary");
    }

    try {
      const response = await fetch("/api/consent", {
        body: JSON.stringify({ preference: nextPreference }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        if (nextPreference === "analytics") {
          setError(
            "Analytics could not be enabled. No optional tracking is active.",
          );
        }
        return;
      }

      setPreference(nextPreference);
    } catch {
      if (nextPreference === "analytics") {
        setError(
          "Analytics could not be enabled. No optional tracking is active.",
        );
      }
    }
  }

  if (preference !== null) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label="Cookie preferences">
      <div>
        <strong>Your experience, your choice.</strong>
        <p>
          Necessary storage keeps forms and AI sessions secure. Optional
          first-party analytics helps us improve emotion.com.{" "}
          <Link href="/cookies">Details</Link>
        </p>
        {error ? <p role="status">{error}</p> : null}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => savePreference("necessary")}>
          Necessary only
        </button>
        <button type="button" onClick={() => savePreference("analytics")}>
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
