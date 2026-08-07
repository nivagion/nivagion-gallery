"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImageUploadForm({ artworkId }: { artworkId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/admin/api/artworks/${artworkId}/images`, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json")
        ? ((await response.json()) as { message?: string })
        : { message: await response.text() };
      setMessage(result.message || (response.ok ? "Uploaded." : "Upload failed."));
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border border-[#084A24]/25 bg-[#F2EDD5] p-5">
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
