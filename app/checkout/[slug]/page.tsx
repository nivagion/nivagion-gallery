import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "../../../components/public/CheckoutForm";
import { ArtworkImageFrame } from "../../../components/public/ArtworkImageFrame";
import { SiteFooter } from "../../../components/public/SiteFooter";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { getArtworkBySlug } from "../../../lib/db/artworks";
import { getSiteSettings } from "../../../lib/db/settings";
import { formatMoney } from "../../../lib/format";
import { getLocale, localizedSettings, t } from "../../../lib/i18n";
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
  const locale = await getLocale();
  const c = t(locale);
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();
  const settings = localizedSettings(await getSiteSettings(), locale);
  if (artwork.status !== "available") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="editorial-title text-4xl">{c.checkout.unavailable}</h1>
          <p className="mt-4 text-[#084A24]">{c.checkout.unavailableText}</p>
          <Link href={`/works/${artwork.slug}`} className="button mt-8">
            {c.common.backToWorks}
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
          {primary ? <ArtworkImageFrame image={primary} alt={primary.alt_text} foregroundClassName="p-3 sm:p-4" /> : null}
          <h1 className="editorial-title mt-6 text-4xl">{artwork.title}</h1>
          <p className="mt-2 text-[#084A24]">{formatMoney(artwork.price_cents, artwork.currency)}</p>
          <p className="mt-6 text-sm leading-6 text-[#084A24]">
            {c.checkout.noCards}
          </p>
        </aside>
        <section>
          <h2 className="editorial-title text-4xl">{c.checkout.title}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#084A24]">{settings.defaultShippingMessage}</p>
          <p className="mt-3 text-sm text-[#E7390D]">{c.common.originalNotPrint}</p>
          <div className="mt-8">
            <CheckoutForm slug={artwork.slug} locale={locale} />
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
