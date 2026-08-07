import type { Metadata } from "next";
import { ArtworkGrid } from "../../components/public/ArtworkGrid";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { listPublicArtworks } from "../../lib/db/artworks";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Archive",
  alternates: { canonical: canonical("/archive") },
};

export default async function ArchivePage() {
  const locale = await getLocale();
  const c = t(locale);
  const [rawSettings, artworks] = await Promise.all([
    getSiteSettings(),
    listPublicArtworks({ sort: "newest", availability: "sold" }),
  ]);
  const settings = localizedSettings(rawSettings, locale);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[96rem] px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="editorial-title text-5xl">{c.archive.title}</h1>
        <p className="mt-4 max-w-2xl text-[#084A24]">{c.archive.description}</p>
        <div className="mt-10">
          <ArtworkGrid artworks={artworks} locale={locale} />
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
