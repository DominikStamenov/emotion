import type { Metadata } from "next";

import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = { title: "Website terms" };

export default function TermsPage() {
  return <LegalPage documentType="terms" />;
}
