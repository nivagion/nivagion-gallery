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
import { getLocale, localizedSettings, t } from "../../../lib/i18n";
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
  const locale = await getLocale();
  const c = t(locale);
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();
  const [rawSettings, adjacent] = await Promise.all([getSiteSettings(), getAdjacentArtworks(artwork)]);
  const settings = localizedSettings(rawSettings, locale);
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
                className="w-full bg-[#F26716]/20 object-cover"
              />
            ) : (
              <div className="aspect-[4/5] bg-[#F26716]/20" />
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
              <StatusBadge status={artwork.status} locale={locale} />
              <span className="text-sm text-[#084A24]">{c.common.originalNotPrint}</span>
            </div>
            <h1 className="editorial-title mt-6 text-5xl">{artwork.title}</h1>
            <dl className="mt-8 grid gap-4 border-y border-[#084A24]/25 py-6 text-sm">
              <Detail label={c.artwork.medium} value={artwork.medium} />
              <Detail label={c.artwork.surface} value={artwork.surface ?? c.artwork.defaultSurface} />
              <Detail label={c.artwork.dimensions} value={artwork.width_cm && artwork.height_cm ? formatDimensions(artwork.width_cm, artwork.height_cm) : c.artwork.defaultDimensions} />
              <Detail label={c.artwork.price} value={formatMoney(artwork.price_cents, artwork.currency)} />
            </dl>
            {artwork.description ? <p className="mt-6 leading-8 text-[#04261E]">{artwork.description}</p> : null}
            <p className="mt-6 text-sm leading-6 text-[#084A24]">{settings.defaultShippingMessage}</p>
            {canPurchase ? (
              <Link href={`/checkout/${artwork.slug}`} className="button mt-8 w-full">
                {c.artwork.purchase}
              </Link>
            ) : (
              <button className="button mt-8 w-full opacity-60" disabled>
                {c.artwork.unavailable}
              </button>
            )}
            <div className="mt-8 flex justify-between gap-4 text-sm underline underline-offset-4">
              {adjacent.previous ? <Link href={`/works/${adjacent.previous.slug}`}>{c.artwork.previous}</Link> : <span />}
              {adjacent.next ? <Link href={`/works/${adjacent.next.slug}`}>{c.artwork.next}</Link> : <span />}
            </div>
          </aside>
        </div>
        {adjacent.related.length ? (
          <section className="mt-20">
            <h2 className="editorial-title mb-8 text-3xl">{c.artwork.related}</h2>
            <ArtworkGrid artworks={adjacent.related} locale={locale} />
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
      <dt className="uppercase tracking-[0.08em] text-[#084A24]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
