import type { Metadata } from "next";
import { LegalPage } from "../../components/public/LegalPage";
import { getSiteSettings } from "../../lib/db/settings";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Shipping and Returns",
  alternates: { canonical: canonical("/shipping-and-returns") },
};

export default async function ShippingPage() {
  const settings = await getSiteSettings();
  return (
    <LegalPage title="Shipping and Returns">
      <p>{settings.defaultShippingMessage}</p>
      <p>{settings.internationalShippingMode}</p>
      <p>{settings.returnConditions}</p>
      <p>LEGAL REVIEW REQUIRED: confirm shipping timelines, return rules, damaged-package process and any statutory obligations before launch.</p>
    </LegalPage>
  );
}
