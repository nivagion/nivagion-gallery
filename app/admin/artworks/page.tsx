import Link from "next/link";
import { Archive, Copy, Plus } from "lucide-react";
import { ArtworkOrderList } from "../../../components/admin/ArtworkOrderList";
import { archiveArtwork, duplicateArtworkAction } from "../actions";
import { listAdminArtworks } from "../../../lib/db/artworks";
import { formatMoney } from "../../../lib/format";
import { imageUrl } from "../../../lib/images";

export default async function AdminArtworksPage() {
  const artworks = await listAdminArtworks();
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="editorial-title text-4xl">Artworks</h1>
          <p className="mt-2 text-[#746f67]">Manage listings, images, publication state and manual ordering.</p>
        </div>
        <Link href="/admin/artworks/new" className="button">
          <Plus size={18} aria-hidden />
          New artwork
        </Link>
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d7d0c5] text-[#746f67]">
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
                  <tr key={artwork.id} className="border-b border-[#d7d0c5] align-top">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {primary ? <img src={imageUrl(primary.object_key)} alt="" className="h-16 w-12 object-cover" /> : <div className="h-16 w-12 bg-[#d7d0c5]" />}
                        <div>
                          <Link href={`/admin/artworks/${artwork.id}`} className="font-semibold underline-offset-4 hover:underline">
                            {artwork.title}
                          </Link>
                          <p className="text-[#746f67]">{artwork.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">{artwork.status}</td>
                    <td className="py-4 pr-4">{formatMoney(artwork.price_cents, artwork.currency)}</td>
                    <td className="py-4 pr-4">{artwork.is_published ? "Yes" : "No"}</td>
                    <td className="py-4 pr-4">
                      <div className="flex gap-2">
                        <form action={duplicateArtworkAction}>
                          <input type="hidden" name="id" value={artwork.id} />
                          <button className="border border-[#d7d0c5] p-2 hover:border-[#181614]" title="Duplicate artwork">
                            <Copy size={16} aria-hidden />
                          </button>
                        </form>
                        <form action={archiveArtwork}>
                          <input type="hidden" name="id" value={artwork.id} />
                          <button className="border border-[#d7d0c5] p-2 hover:border-[#181614]" title="Archive artwork">
                            <Archive size={16} aria-hidden />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!artworks.length ? <p className="border border-[#d7d0c5] p-6 text-[#746f67]">No artworks yet.</p> : null}
        </div>
        <aside>
          <h2 className="editorial-title mb-4 text-2xl">Manual Order</h2>
          <ArtworkOrderList artworks={artworks} />
        </aside>
      </section>
      <section>
        <h2 className="editorial-title mb-4 text-2xl">Visual Grid</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {artworks.map((artwork) => {
            const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
            return (
              <Link key={artwork.id} href={`/admin/artworks/${artwork.id}`} className="border border-[#d7d0c5] bg-[#f8f4ed] p-3">
                {primary ? <img src={imageUrl(primary.object_key)} alt="" className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] bg-[#d7d0c5]" />}
                <p className="mt-3 font-medium">{artwork.title}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
