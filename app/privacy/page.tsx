import type { Metadata } from "next";
import { LegalPage } from "../../components/public/LegalPage";
import { getLocale, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: canonical("/privacy") },
};

export default async function PrivacyPage() {
  const c = t(await getLocale());
  return (
    <LegalPage title={c.legal.privacyTitle}>
      {c.legal.privacy.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </LegalPage>
  );
}
