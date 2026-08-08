import Link from "next/link";
import { Copy, Images, ListOrdered, Pencil, Plus } from "lucide-react";
import { DeleteArtworkButton } from "../../../components/admin/DeleteArtworkButton";
import { ArtworkImageFrame, artworkOrientation } from "../../../components/public/ArtworkImageFrame";
import { duplicateArtworkAction } from "../actions";
import { listAdminArtworks } from "../../../lib/db/artworks";
import { formatArtworkStatus } from "../../../lib/artwork-status";
import { formatMoney } from "../../../lib/format";

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
      <section className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#084A24]/25 text-[#084A24]">
              <th className="py-3 pr-4">Artwork</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Published</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((artwork) => {
              const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
              return (
                <tr key={artwork.id} className="border-b border-[#084A24]/25 align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {primary ? (
                        <ArtworkImageFrame image={primary} className="h-16 w-14" foregroundClassName="!p-1" />
                      ) : (
                        <div className="h-16 w-14 bg-[#F26716]/20" />
                      )}
                      <div>
                        <Link href={`/admin/artworks/${artwork.id}`} className="font-semibold underline-offset-4 hover:underline">
                          {artwork.title}
                        </Link>
                        <p className="text-[#084A24]">{artwork.medium}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{formatArtworkStatus(artwork.status)}</td>
                  <td className="py-4 pr-4">{formatMoney(artwork.price_cents, artwork.currency)}</td>
                  <td className="py-4 pr-4">{artwork.is_published ? "Yes" : "No"}</td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/artworks/${artwork.id}`} className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Edit artwork details, price and description">
                        <Pencil size={16} aria-hidden />
                      </Link>
                      <form action={duplicateArtworkAction}>
                        <input type="hidden" name="id" value={artwork.id} />
                        <button className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Duplicate artwork">
                          <Copy size={16} aria-hidden />
                        </button>
                      </form>
                      <DeleteArtworkButton artworkId={artwork.id} title={artwork.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!artworks.length ? <p className="border border-[#084A24]/25 p-6 text-[#084A24]">No artworks yet.</p> : null}
      </section>
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
