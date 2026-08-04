import type { Metadata } from "next";
import { LegalPage } from "../../components/public/LegalPage";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: canonical("/privacy") },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This editable draft explains how contact messages and purchase requests are handled.</p>
      <p>Collected details may include name, email, telephone, shipping address, message content, artwork reference and order reference.</p>
      <p>LEGAL REVIEW REQUIRED: confirm controller identity, retention periods, lawful basis, processor list and buyer rights before launch.</p>
      <p>No card data is collected or stored by this website.</p>
    </LegalPage>
  );
}
