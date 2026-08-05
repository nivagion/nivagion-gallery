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
    listPublicArtworks({ sort: "manual", availability: "available" }),
  ]);
  const settings = localizedSettings(rawSettings, locale);
  const visible = artworks.slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid max-w-3xl content-start gap-6">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.16em] text-[#E7390D]">{c.home.eyebrow}</p>
              <h1 className="editorial-title max-w-3xl text-5xl font-black leading-tight sm:text-7xl">
                {siteConfig.name}
              </h1>
              <p className="mt-5 max-w-xl text-xl leading-8 text-[#04261E]">{settings.siteDescription}</p>
            </div>
            <Link href="/works" className="button button-secondary">
              {c.common.viewAll}
            </Link>
          </div>
          <div className="pt-2">
            <div className="mb-5 flex items-end justify-between gap-6">
              <h2 className="editorial-title text-3xl font-black">{c.home.featured}</h2>
              <Link href="/works" className="text-sm font-bold uppercase tracking-[0.08em] text-[#E7390D]">
                {c.common.viewAll}
              </Link>
            </div>
            <ArtworkGrid artworks={visible} locale={locale} />
          </div>
        </section>
        <section className="border-y border-[#084A24]/25 bg-[#F2EDD5] px-4 py-12 text-[#04261E] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_auto] md:items-center">
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
