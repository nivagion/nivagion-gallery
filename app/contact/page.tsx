import type { Metadata } from "next";
import { ContactForm } from "../../components/public/ContactForm";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: canonical("/contact") },
};

type Props = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const locale = await getLocale();
  const c = t(locale);
  const [{ sent }, rawSettings] = await Promise.all([searchParams, getSiteSettings()]);
  const settings = localizedSettings(rawSettings, locale);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h1 className="editorial-title text-5xl">{c.contact.title}</h1>
          <p className="mt-5 leading-8 text-[#084A24]">
            {c.contact.description}
          </p>
          <a className="mt-6 inline-block underline underline-offset-4" href={`mailto:${settings.contactEmail}`}>
            {settings.contactEmail}
          </a>
          {c.contact.turnstile ? <p className="mt-6 text-sm text-[#084A24]">{c.contact.turnstile}</p> : null}
        </div>
        {sent ? (
          <div className="border border-[#084A24]/25 p-8">
            <h2 className="editorial-title text-3xl">{c.contact.received}</h2>
            <p className="mt-4 text-[#084A24]">{c.contact.receivedText}</p>
          </div>
        ) : (
          <ContactForm locale={locale} />
        )}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
