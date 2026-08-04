import type { Metadata } from "next";
import { ArtworkGrid } from "../../components/public/ArtworkGrid";
import { SiteFooter } from "../../components/public/SiteFooter";
import { SiteHeader } from "../../components/public/SiteHeader";
import { listPublicArtworks } from "../../lib/db/artworks";
import { getSiteSettings } from "../../lib/db/settings";
import { canonical } from "../../lib/site";

export const metadata: Metadata = {
  title: "Archive",
  alternates: { canonical: canonical("/archive") },
};

export default async function ArchivePage() {
  const [settings, artworks] = await Promise.all([
    getSiteSettings(),
    listPublicArtworks({ sort: "newest", availability: "sold" }),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="editorial-title text-5xl">Archive</h1>
        <p className="mt-4 max-w-2xl text-[#746f67]">Sold works remain visible here as part of the studio archive.</p>
        <div className="mt-10">
          <ArtworkGrid artworks={artworks} />
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
