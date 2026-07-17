import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

function createSecurityHeaders(production) {
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://api.emotion.com",
    "font-src 'self' data:",
    "media-src 'self' blob: https://*.supabase.co https://api.emotion.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.emotion.com wss://api.emotion.com",
    "worker-src 'self' blob:",
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

/** @type {import('next').NextConfig} */
export default function nextConfig(phase) {
  const securityHeaders = createSecurityHeaders(
    phase !== PHASE_DEVELOPMENT_SERVER,
  );

  return {
    async headers() {
      return [{ headers: securityHeaders, source: "/(.*)" }];
    },
  };
}
