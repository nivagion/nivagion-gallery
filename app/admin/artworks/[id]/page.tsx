import { notFound } from "next/navigation";
import { ArtworkForm } from "../../../../components/admin/ArtworkForm";
import { ImageManager } from "../../../../components/admin/ImageManager";
import { ImageUploadForm } from "../../../../components/admin/ImageUploadForm";
import { getArtworkById } from "../../../../lib/db/artworks";
import { formatDateTime } from "../../../../lib/format";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArtworkPage({ params }: Props) {
  const { id } = await params;
  const artwork = await getArtworkById(id);
  if (!artwork) notFound();
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="editorial-title text-4xl">Edit Artwork</h1>
        <p className="mt-2 text-[#746f67]">Last updated {formatDateTime(artwork.updated_at)}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <ArtworkForm artwork={artwork} />
        <div className="grid content-start gap-6">
          <ImageUploadForm artworkId={artwork.id} />
          <ImageManager artworkId={artwork.id} images={artwork.images} />
        </div>
      </div>
    </div>
  );
}
