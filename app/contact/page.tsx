import type { Metadata } from "next";
import { ContactForm } from "../../components/public/ContactForm";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: canonical("/contact") },
};

type Props = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const [{ sent }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h1 className="editorial-title text-5xl">Contact</h1>
          <p className="mt-5 leading-8 text-[#746f67]">
            For artwork availability, purchase requests, commissions, shipping, or studio questions.
          </p>
          <a className="mt-6 inline-block underline underline-offset-4" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          <p className="mt-6 text-sm text-[#746f67]">
            Optional Turnstile spam protection is prepared in configuration and can be enabled when keys are added.
          </p>
        </div>
        {sent ? (
          <div className="border border-[#d7d0c5] p-8">
            <h2 className="editorial-title text-3xl">Message received</h2>
            <p className="mt-4 text-[#746f67]">Thank you. The studio will reply by email.</p>
          </div>
        ) : (
          <ContactForm />
        )}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
