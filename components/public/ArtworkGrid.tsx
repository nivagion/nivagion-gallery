import Link from "next/link";
import type { ArtworkWithImages } from "../../lib/types";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";
import { StatusBadge } from "./StatusBadge";

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
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork) => {
        const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
        return (
          <Link key={artwork.id} href={`/works/${artwork.slug}`} className="group block">
            <div className="relative overflow-hidden bg-[#F26716]/20">
              {primary ? (
                <img
                  src={imageUrl(primary.object_key)}
                  alt={primary.alt_text}
                  loading="lazy"
                  width={primary.width ?? 900}
                  height={primary.height ?? 1200}
                  className="aspect-[4/5] h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
                />
              ) : (
                <div className="aspect-[4/5] w-full bg-[#F26716]/20" aria-label="No image uploaded" />
              )}
              <div className="absolute left-3 top-3">
                <StatusBadge status={artwork.status} locale={locale} />
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="editorial-title text-xl">{artwork.title}</h2>
                <p className="mt-1 text-sm text-[#084A24]">{artwork.medium} · {c.common.originalNotPrint}</p>
              </div>
              <p className="whitespace-nowrap text-sm">{formatMoney(artwork.price_cents, artwork.currency)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
