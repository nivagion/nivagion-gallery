import type { Metadata } from "next";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: canonical("/about") },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const c = t(locale);
  const settings = localizedSettings(await getSiteSettings(), locale);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="editorial-title text-5xl sm:text-6xl">{c.about.title}</h1>
        <div className="mt-10 grid max-w-2xl gap-5 border-l-4 border-[#E7390D] pl-6 text-lg leading-8 text-[#04261E] sm:mt-12 sm:pl-8 sm:text-xl sm:leading-9">
          <p>{settings.siteDescription}</p>
          <p>{c.about.customRequests}</p>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
