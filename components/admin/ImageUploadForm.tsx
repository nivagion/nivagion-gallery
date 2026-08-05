"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

export function ImageUploadForm({ artworkId }: { artworkId: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch(`/admin/api/artworks/${artworkId}/images`, {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as { message?: string };
    setPending(false);
    setMessage(result.message ?? (response.ok ? "Uploaded." : "Upload failed."));
    if (response.ok) {
      form.current?.reset();
      window.location.reload();
    }
  }

  return (
    <form ref={form} onSubmit={submit} className="grid gap-4 border border-[#084A24]/25 bg-[#F2EDD5] p-5">
      <h2 className="editorial-title text-2xl">Images</h2>
      {message ? <p className="text-sm text-[#084A24]">{message}</p> : null}
      <label className="label">
        Image files
        <input className="field" name="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required />
      </label>
      <label className="label">
        Alt text
        <input className="field" name="altText" required />
      </label>
      <label className="label">
        Caption
        <input className="field" name="caption" />
      </label>
      <label className="flex items-center gap-3">
        <input type="checkbox" name="isPrimary" />
        Use first uploaded image as primary
      </label>
      <button className="button justify-self-start" disabled={pending}>
        <Upload size={18} aria-hidden />
        {pending ? "Uploading" : "Upload images"}
      </button>
    </form>
  );
}
