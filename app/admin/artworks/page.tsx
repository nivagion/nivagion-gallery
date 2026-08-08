import Link from "next/link";
import { Images, ListOrdered, Plus } from "lucide-react";
import { AdminArtworkTable } from "../../../components/admin/AdminArtworkTable";
import { ArtworkImageFrame, artworkOrientation } from "../../../components/public/ArtworkImageFrame";
import { listAdminArtworks } from "../../../lib/db/artworks";
import { formatArtworkStatus } from "../../../lib/artwork-status";

export default async function AdminArtworksPage() {
  const artworks = await listAdminArtworks();
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-4xl">Artworks</h1>
          <p className="mt-2 text-[#084A24]">Manage listings, images, status and prices.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/artworks/order" className="button button-secondary">
            <ListOrdered size={18} aria-hidden />
            Manual order
          </Link>
          <Link href="/admin/artworks/multiple" className="button button-secondary">
            <Images size={18} aria-hidden />
            Add multiple
          </Link>
          <Link href="/admin/artworks/new" className="button">
            <Plus size={18} aria-hidden />
            New artwork
          </Link>
        </div>
      </div>
      <AdminArtworkTable artworks={artworks} />
      <section>
        <h2 className="editorial-title mb-4 text-2xl">Visual Grid</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {artworks.map((artwork) => {
            const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
            const orientation = artworkOrientation(primary);
            const cardClass =
              orientation === "landscape"
                ? "w-full sm:w-[calc(50%-0.75rem)] xl:w-[calc(33.333%-1rem)]"
                : "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]";

            return (
              <Link
                key={artwork.id}
                href={`/admin/artworks/${artwork.id}`}
                className={`border border-[#084A24]/25 bg-[#F2EDD5] p-3 ${cardClass}`}
              >
                {primary ? <ArtworkImageFrame image={primary} /> : <div className="aspect-[4/5] bg-[#F26716]/20" />}
                <div className="mt-4 flex items-start justify-between gap-3">
                  <p className="font-medium">{artwork.title}</p>
                  <p className="text-sm text-[#084A24]">{formatArtworkStatus(artwork.status)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
