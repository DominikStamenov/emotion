const localSiteUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  try {
    return new URL(value || localSiteUrl).toString().replace(/\/$/, "");
  } catch {
    return localSiteUrl;
  }
}

export const publicContactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const siteHost = new URL(siteUrl).host;
