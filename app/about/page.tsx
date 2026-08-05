import type { Metadata } from "next";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../lib/i18n";
import { canonical, siteConfig } from "../../lib/site";

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
      <main className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h1 className="editorial-title text-5xl">{c.about.title}</h1>
          <p className="mt-5 text-[#084A24]">{siteConfig.artistLocation}</p>
        </div>
        <div className="grid gap-8 leading-8 text-[#04261E]">
          <p>{settings.siteDescription}</p>
          <p>{settings.artistBiography}</p>
          <p>{settings.studioLocationWording}</p>
          <p>{c.about.customRequests}</p>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
