import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../../components/public/LegalPage";
import { getLocale, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Shipping",
  alternates: { canonical: canonical("/shipping-and-returns") },
};

export default async function ShippingPage() {
  const c = t(await getLocale());
  return (
    <LegalPage title={c.legal.shippingTitle}>
      {c.legal.shipping.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <Link href="/contact" className="button button-secondary justify-self-start">
        {c.common.writeMe}
      </Link>
    </LegalPage>
  );
}
