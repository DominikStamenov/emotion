import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

function createSecurityHeaders(production) {
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    "media-src 'self' blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    production ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
    ...(production
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
  ];
}

/** @type {import("next").NextConfig} */
export default function nextConfig(phase) {
  const headers = createSecurityHeaders(phase !== PHASE_DEVELOPMENT_SERVER);

  return {
    transpilePackages: ["@repo/ui", "@repo/motion"],
    async headers() {
      return [{ headers, source: "/(.*)" }];
    },
  };
}
