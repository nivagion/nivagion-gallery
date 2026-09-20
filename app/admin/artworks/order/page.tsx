import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArtworkOrderList } from "../../../../components/admin/ArtworkOrderList";
import { listAdminArtworks } from "../../../../lib/db/artworks";

export default async function AdminArtworkOrderPage() {
  const artworks = await listAdminArtworks();

  return (
    <div className="grid min-w-0 gap-8">
      <div>
        <Link href="/admin/artworks" className="inline-flex items-center gap-2 text-sm underline underline-offset-4">
          <ArrowLeft size={16} aria-hidden />
          Back to artworks
        </Link>
        <h1 className="editorial-title mt-5 text-4xl">Manual Order</h1>
        <p className="mt-2 text-[#084A24]">Drag works into the order you want, then save.</p>
      </div>
      <ArtworkOrderList artworks={artworks} />
    </div>
  );
}
