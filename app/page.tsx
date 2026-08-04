import Link from "next/link";
import { ArtworkGrid } from "../components/public/ArtworkGrid";
import { SiteFooter } from "../components/public/SiteFooter";
import { SiteHeader } from "../components/public/SiteHeader";
import { listFeaturedArtworks, listPublicArtworks } from "../lib/db/artworks";
import { getSiteSettings } from "../lib/db/settings";
import { imageUrl } from "../lib/images";
import { siteConfig } from "../lib/site";

export default async function HomePage() {
  const [settings, featured, artworks] = await Promise.all([
    getSiteSettings(),
    listFeaturedArtworks(),
    listPublicArtworks({ sort: "manual" }),
  ]);
  const visible = featured.length ? featured : artworks.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid min-h-[82vh] max-w-7xl content-between gap-12 px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-5 text-sm uppercase tracking-[0.16em] text-[#746f67]">Original art from Croatia</p>
              <h1 className="editorial-title max-w-3xl text-5xl leading-tight sm:text-7xl">
                {siteConfig.name}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#4b4741]">{settings.siteDescription}</p>
            </div>
            {visible[0]?.images[0] ? (
              <Link href={`/works/${visible[0].slug}`} className="group block">
                <img
                  src={imageUrl(visible[0].images[0].object_key)}
                  alt={visible[0].images[0].alt_text}
                  className="max-h-[68vh] w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                  width={visible[0].images[0].width ?? 1200}
                  height={visible[0].images[0].height ?? 1500}
                />
              </Link>
            ) : null}
          </div>
          <div className="grid gap-3 border-t border-[#d7d0c5] pt-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="max-w-2xl text-[#746f67]">{settings.homepageIntroduction}</p>
            <Link href="/works" className="button button-secondary">
              View all work
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="editorial-title text-3xl">Featured Works</h2>
            <Link href="/works" className="text-sm underline underline-offset-4">
              All works
            </Link>
          </div>
          <ArtworkGrid artworks={visible} />
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
          <h2 className="editorial-title text-3xl">Artist Introduction</h2>
          <p className="leading-8 text-[#4b4741]">{settings.artistBiography}</p>
        </section>
        <section className="border-y border-[#d7d0c5] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="editorial-title text-3xl">Contact</h2>
              <p className="mt-3 text-[#746f67]">For availability, commissions, shipping, or studio enquiries.</p>
            </div>
            <Link href="/contact" className="button">
              Write to the studio
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
