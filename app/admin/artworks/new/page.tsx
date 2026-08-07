import { ArtworkForm } from "../../../../components/admin/ArtworkForm";

export default function NewArtworkPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">New Artwork</h1>
        <p className="mt-2 text-[#084A24]">Add the details first, then upload images after saving.</p>
      </div>
      <ArtworkForm />
    </div>
  );
}
