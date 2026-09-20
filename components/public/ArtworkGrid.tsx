import Link from "next/link";
import type { ArtworkWithImages } from "../../lib/types";
import { formatMoney } from "../../lib/format";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";
import { ArtworkImageFrame, artworkOrientation } from "./ArtworkImageFrame";
import { StatusBadge } from "./StatusBadge";
import { publicArtworkTitle } from "../../lib/batch-artworks";

export function ArtworkGrid({ artworks, locale = "en" }: { artworks: ArtworkWithImages[]; locale?: Locale }) {
  const c = t(locale);
  if (!artworks.length) {
    return (
      <div className="border border-[#084A24]/25 px-6 py-16 text-center text-[#084A24]">
        {c.common.noPublished}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-12">
      {artworks.map((artwork) => {
        const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
        const title = publicArtworkTitle(artwork.title);
        const orientation = artworkOrientation(primary);
        const cardClass =
          orientation === "landscape"
            ? "w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]"
            : "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]";

        return (
          <Link key={artwork.id} href={`/works/${artwork.slug}`} className={`group block ${cardClass}`}>
            <div>
              {primary ? (
                <ArtworkImageFrame image={primary} alt={primary.alt_text} foregroundClassName="group-hover:scale-[1.01]" />
              ) : (
                <div className="aspect-[4/5] w-full bg-[#F26716]/20" aria-label="No image uploaded" />
              )}
            </div>
            <div className="mt-4 flex min-h-28 items-start justify-between gap-4">
              <div>
                <div className="mb-3">
                  <StatusBadge status={artwork.status} locale={locale} />
                </div>
                {title ? <h2 className="editorial-title text-xl">{title}</h2> : null}
                <p className="mt-1 text-sm text-[#084A24]">
                  {artwork.medium} · {c.common.originalNotPrint}
                </p>
              </div>
              <p className="whitespace-nowrap text-sm">{formatMoney(artwork.price_cents, artwork.currency, locale)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
