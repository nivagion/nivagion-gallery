import Link from "next/link";
import { ArtworkGrid } from "../components/public/ArtworkGrid";
import { SiteFooter } from "../components/public/SiteFooter";
import { SiteHeader } from "../components/public/SiteHeader";
import { listPublicArtworks } from "../lib/db/artworks";
import { getSiteSettings } from "../lib/db/settings";
import { getLocale, localizedSettings, t } from "../lib/i18n";
import { siteConfig } from "../lib/site";

export default async function HomePage() {
  const locale = await getLocale();
  const c = t(locale);
  const [rawSettings, artworks] = await Promise.all([
    getSiteSettings(),
    listPublicArtworks({ sort: "manual", availability: "available", limit: 6 }),
  ]);
  const settings = localizedSettings(rawSettings, locale);
  const visible = artworks;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-[96rem] gap-10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid max-w-3xl content-start gap-6">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.16em] text-[#E7390D]">{c.home.eyebrow}</p>
              <h1 className="editorial-title max-w-3xl text-5xl font-black leading-tight sm:text-7xl">
                {siteConfig.name}
              </h1>
            </div>
          </div>
          <div>
            <div className="mb-5">
              <h2 className="editorial-title text-3xl font-black">{c.home.featured}</h2>
            </div>
            <ArtworkGrid artworks={visible} locale={locale} />
          </div>
        </section>
        <section className="border-y border-[#084A24]/25 bg-[#F2EDD5] px-4 py-12 text-[#04261E] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[96rem] gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="editorial-title text-3xl font-black">{c.nav.contact}</h2>
              <p className="mt-3 max-w-xl">{c.home.contactText}</p>
            </div>
            <Link href="/contact" className="button">
              {c.common.writeMe}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
