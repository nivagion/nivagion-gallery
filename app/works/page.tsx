import type { Metadata } from "next";
import { ArtworkGrid } from "../../components/public/ArtworkGrid";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { WorkSortForm } from "../../components/public/WorkSortForm";
import { listPublicArtworks } from "../../lib/db/artworks";
import { getSiteSettings } from "../../lib/db/settings";
import { getLocale, localizedSettings, t } from "../../lib/i18n";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Works",
  alternates: { canonical: canonical("/works") },
};

type Props = {
  searchParams: Promise<{ sort?: string; availability?: string }>;
};

export default async function WorksPage({ searchParams }: Props) {
  const params = await searchParams;
  const locale = await getLocale();
  const c = t(locale);
  const sort = ["manual", "newest", "price-asc", "price-desc"].includes(params.sort ?? "")
    ? (params.sort as "manual" | "newest" | "price-asc" | "price-desc")
    : "manual";
  const availability = ["all", "available", "sold"].includes(params.availability ?? "")
    ? (params.availability as "all" | "available" | "sold")
    : "all";
  const [rawSettings, artworks] = await Promise.all([getSiteSettings(), listPublicArtworks({ sort, availability })]);
  const settings = localizedSettings(rawSettings, locale);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 className="editorial-title text-5xl">{c.works.title}</h1>
            <p className="mt-4 max-w-2xl text-[#084A24]">{c.works.description}</p>
          </div>
          <WorkSortForm locale={locale} />
        </div>
        <ArtworkGrid artworks={artworks} locale={locale} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
