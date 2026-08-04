import type { Metadata } from "next";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { getSiteSettings } from "../../lib/db/settings";
import { canonical, siteConfig } from "../../lib/site";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: canonical("/about") },
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h1 className="editorial-title text-5xl">About</h1>
          <p className="mt-5 text-[#746f67]">{siteConfig.artistLocation}</p>
        </div>
        <div className="grid gap-8 leading-8 text-[#4b4741]">
          <p>{settings.siteDescription}</p>
          <p>{settings.artistBiography}</p>
          <p>{settings.studioLocationWording}</p>
          <p>{settings.commissionAvailability}</p>
          <div className="aspect-[4/3] border border-[#d7d0c5] bg-[#e8e1d6] p-6 text-sm text-[#746f67]">
            Artist photograph placeholder.
          </div>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
