import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "../../../components/public/CheckoutForm";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { getArtworkBySlug } from "../../../lib/db/artworks";
import { getSiteSettings } from "../../../lib/db/settings";
import { formatMoney } from "../../../lib/format";
import { imageUrl } from "../../../lib/images";
import { canonical } from "../../../lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  return {
    title: artwork ? `Purchase ${artwork.title}` : "Purchase Artwork",
    alternates: { canonical: canonical(`/checkout/${slug}`) },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();
  const settings = await getSiteSettings();
  if (artwork.status !== "available") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="editorial-title text-4xl">Artwork unavailable</h1>
          <p className="mt-4 text-[#746f67]">This work is currently {artwork.status} and cannot be purchased.</p>
          <Link href={`/works/${artwork.slug}`} className="button mt-8">
            Return to artwork
          </Link>
        </main>
        <SiteFooter settings={settings} />
      </>
    );
  }
  const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside>
          {primary ? <img src={imageUrl(primary.object_key)} alt={primary.alt_text} className="w-full" /> : null}
          <h1 className="editorial-title mt-6 text-4xl">{artwork.title}</h1>
          <p className="mt-2 text-[#746f67]">{formatMoney(artwork.price_cents, artwork.currency)}</p>
          <p className="mt-6 text-sm leading-6 text-[#746f67]">
            No card information is collected on this website. If a Revolut payment link is configured, payment happens on Revolut after this request is saved.
          </p>
        </aside>
        <section>
          <h2 className="editorial-title text-4xl">Purchase request</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#746f67]">{settings.defaultShippingMessage}</p>
          <div className="mt-8">
            <CheckoutForm slug={artwork.slug} />
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
