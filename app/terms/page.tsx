import type { Metadata } from "next";
import { LegalPage } from "../../components/public/LegalPage";
import { getLocale, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Terms of Sale",
  alternates: { canonical: canonical("/terms") },
};

export default async function TermsPage() {
  const c = t(await getLocale());
  return (
    <LegalPage title={c.legal.termsTitle}>
      {c.legal.terms.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </LegalPage>
  );
}
