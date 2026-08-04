import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkGrid } from "../../../components/public/ArtworkGrid";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { StatusBadge } from "../../../components/public/StatusBadge";
import { getAdjacentArtworks, getArtworkBySlug } from "../../../lib/db/artworks";
import { getSiteSettings } from "../../../lib/db/settings";
import { formatDimensions, formatMoney } from "../../../lib/format";
import { imageUrl } from "../../../lib/images";
import { canonical, siteConfig } from "../../../lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return {};
  const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
  return {
    title: artwork.title,
    description: artwork.description ?? `${artwork.title} by ${siteConfig.name}.`,
    alternates: { canonical: canonical(`/works/${artwork.slug}`) },
    openGraph: {
      title: artwork.title,
      description: artwork.description ?? siteConfig.description,
      images: primary ? [{ url: imageUrl(primary.object_key), alt: primary.alt_text }] : [],
    },
  };
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();
  const [settings, adjacent] = await Promise.all([getSiteSettings(), getAdjacentArtworks(artwork)]);
  const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
  const canPurchase = artwork.status === "available";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    artMedium: artwork.medium,
    artform: "Original artwork",
    creator: { "@type": "Person", name: siteConfig.name },
    image: primary ? canonical(imageUrl(primary.object_key)) : undefined,
    offers: {
      "@type": "Offer",
      price: artwork.price_cents ? artwork.price_cents / 100 : undefined,
      priceCurrency: artwork.currency,
      availability: canPurchase ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: canonical(`/works/${artwork.slug}`),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            {primary ? (
              <img
                src={imageUrl(primary.object_key)}
                alt={primary.alt_text}
                width={primary.width ?? 1200}
                height={primary.height ?? 1500}
                className="w-full bg-[#e8e1d6] object-cover"
              />
            ) : (
              <div className="aspect-[4/5] bg-[#e8e1d6]" />
            )}
            {artwork.images.length > 1 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {artwork.images
                  .filter((image) => image.id !== primary?.id)
                  .map((image) => (
                    <img key={image.id} src={imageUrl(image.object_key)} alt={image.alt_text} width={image.width ?? 600} height={image.height ?? 750} loading="lazy" />
                  ))}
              </div>
            ) : null}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3">
              <StatusBadge status={artwork.status} />
              <span className="text-sm text-[#746f67]">One-of-one original unless otherwise noted</span>
            </div>
            <h1 className="editorial-title mt-6 text-5xl">{artwork.title}</h1>
            {artwork.subtitle ? <p className="mt-3 text-xl text-[#746f67]">{artwork.subtitle}</p> : null}
            <dl className="mt-8 grid gap-4 border-y border-[#d7d0c5] py-6 text-sm">
              <Detail label="Year" value={artwork.year?.toString() ?? "To be confirmed"} />
              <Detail label="Medium" value={artwork.medium} />
              <Detail label="Surface" value={artwork.surface ?? "To be confirmed"} />
              <Detail label="Dimensions" value={formatDimensions(artwork.width_cm, artwork.height_cm)} />
              <Detail label="Edition" value="One-of-one original" />
              <Detail label="Price" value={formatMoney(artwork.price_cents, artwork.currency)} />
            </dl>
            {artwork.description ? <p className="mt-6 leading-8 text-[#4b4741]">{artwork.description}</p> : null}
            <p className="mt-6 text-sm leading-6 text-[#746f67]">{settings.defaultShippingMessage}</p>
            {canPurchase ? (
              <Link href={`/checkout/${artwork.slug}`} className="button mt-8 w-full">
                Purchase artwork
              </Link>
            ) : (
              <button className="button mt-8 w-full opacity-60" disabled>
                Purchasing unavailable
              </button>
            )}
            <div className="mt-8 flex justify-between gap-4 text-sm underline underline-offset-4">
              {adjacent.previous ? <Link href={`/works/${adjacent.previous.slug}`}>Previous</Link> : <span />}
              {adjacent.next ? <Link href={`/works/${adjacent.next.slug}`}>Next</Link> : <span />}
            </div>
          </aside>
        </div>
        {adjacent.related.length ? (
          <section className="mt-20">
            <h2 className="editorial-title mb-8 text-3xl">Related Works</h2>
            <ArtworkGrid artworks={adjacent.related} />
          </section>
        ) : null}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4">
      <dt className="uppercase tracking-[0.08em] text-[#746f67]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
