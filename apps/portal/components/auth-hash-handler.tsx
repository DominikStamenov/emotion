"use client";

import { useEffect } from "react";

import { createClient } from "../lib/supabase/client";

export function AuthHashHandler() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const type = hash.get("type");

    if (!accessToken || !refreshToken) {
      return;
    }

    const supabase = createClient();

    void supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .then(({ error }) => {
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${window.location.search}`,
        );

        if (error) {
          window.location.replace(
            `/login?error=${encodeURIComponent("This invitation is invalid or has expired. Ask eMotion for a new invitation.")}`,
          );
          return;
        }

        window.location.replace(
          type === "invite" || type === "recovery" ? "/set-password" : "/",
        );
      });
  }, []);

  return null;
}
