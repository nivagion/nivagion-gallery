import type { Metadata } from "next";
import { LegalPage } from "../../components/public/LegalPage";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Terms of Sale",
  alternates: { canonical: canonical("/terms") },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Sale">
      <p>This editable draft covers original artwork purchase requests, manual confirmation and order fulfilment.</p>
      <p>Artwork prices are shown in EUR and are recalculated server-side when an order is created.</p>
      <p>LEGAL/TAX REVIEW REQUIRED: add seller details, Croatian business information, VAT status if applicable and required consumer notices before launch.</p>
      <p>Payment through a stored Revolut link does not automatically mark an order paid until the admin confirms it.</p>
    </LegalPage>
  );
}
