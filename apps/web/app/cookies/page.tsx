import type { Metadata } from "next";

import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = { title: "Cookie notice" };

export default function CookiesPage() {
  return <LegalPage documentType="cookies" />;
}
