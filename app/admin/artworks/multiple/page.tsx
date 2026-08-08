import { BulkArtworkUploadForm } from "../../../../components/admin/BulkArtworkUploadForm";

export default function MultipleArtworksPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">Add Multiple Artworks</h1>
        <p className="mt-2 text-[#084A24]">Create one unnamed artwork for each prepared image.</p>
      </div>
      <BulkArtworkUploadForm />
    </div>
  );
}
