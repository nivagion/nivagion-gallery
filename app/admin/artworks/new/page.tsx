import { ArtworkForm } from "../../../../components/admin/ArtworkForm";

export default function NewArtworkPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="editorial-title text-4xl">New Artwork</h1>
        <p className="mt-2 text-[#084A24]">Create as a draft, then publish when images and details are ready.</p>
      </div>
      <ArtworkForm />
    </div>
  );
}
