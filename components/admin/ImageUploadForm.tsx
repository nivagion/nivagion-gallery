"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { processArtworkImage, type ProcessedArtworkImage } from "../../lib/client/process-artwork-image";

export function ImageUploadForm({ artworkId }: { artworkId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedArtworkImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [processingError, setProcessingError] = useState("");

  useEffect(() => {
    return () => {
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  }, [previewUrls]);

  async function processFiles(files: FileList | null) {
    for (const url of previewUrls) URL.revokeObjectURL(url);
    setPreviewUrls([]);
    setProcessedImages([]);
    setProcessingError("");
    setMessage("");
    if (!files?.length) return;

    setProcessing(true);
    try {
      const next = await Promise.all(Array.from(files).map((file) => processArtworkImage(file)));
      setProcessedImages(next);
      setPreviewUrls(next.map((item) => URL.createObjectURL(item.file)));
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : "Image processing failed.");
    } finally {
      setProcessing(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) {
      setMessage("Wait for image processing to finish.");
      return;
    }
    if (!processedImages.length) {
      setMessage("Choose at least one image.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const form = event.currentTarget;
      const body = new FormData();
      body.set("altText", new FormData(form).get("altText") ?? "");
      body.set("caption", new FormData(form).get("caption") ?? "");
      if (new FormData(form).has("isPrimary")) body.set("isPrimary", "on");
      for (const image of processedImages) {
        body.append("files", image.file, image.processed.filename);
      }
      const response = await fetch(`/admin/api/artworks/${artworkId}/images`, {
        method: "POST",
        body,
      });
      const contentType = response.headers.get("content-type") ?? "";
      const result = contentType.includes("application/json")
        ? ((await response.json()) as { message?: string })
        : { message: await response.text() };
      setMessage(result.message || (response.ok ? "Uploaded." : "Upload failed."));
      if (response.ok) {
        form.reset();
        setProcessedImages([]);
        for (const url of previewUrls) URL.revokeObjectURL(url);
        setPreviewUrls([]);
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
      {processingError ? <p className="text-sm text-[#E7390D]">{processingError}</p> : null}
      <label className="label">
        Image files
        <input
          className="field"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          onChange={(event) => void processFiles(event.currentTarget.files)}
        />
      </label>
      {processing ? <p className="text-sm text-[#084A24]">Preparing WebP images...</p> : null}
      {processedImages.length ? (
        <div className="grid gap-4">
          {processedImages.map((image, index) => (
            <figure key={`${image.original.filename}-${index}`} className="grid gap-3 border border-[#084A24]/20 bg-[#FBF7E8] p-3">
              {previewUrls[index] ? (
                <img
                  src={previewUrls[index]}
                  alt=""
                  className="max-h-64 w-full object-contain"
                />
              ) : null}
              <div className="grid gap-3 text-sm text-[#084A24] sm:grid-cols-2">
                <ImageStats title="Original" info={image.original} />
                <ImageStats title="Web version" info={image.processed} reduction={reduction(image.original.size, image.processed.size)} />
              </div>
            </figure>
          ))}
        </div>
      ) : null}
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
      <button className="button justify-self-start" disabled={pending || processing || Boolean(processingError)}>
        <Upload size={18} aria-hidden />
        {processing ? "Preparing" : pending ? "Uploading" : "Upload images"}
      </button>
    </form>
  );
}

function ImageStats({
  title,
  info,
  reduction,
}: {
  title: string;
  info: { filename: string; width: number; height: number; size: number; mimeType: string };
  reduction?: number | null;
}) {
  return (
    <div>
      <p className="font-semibold text-[#04261E]">{title}</p>
      <p className="break-all">{info.filename}</p>
      <p>{info.width} x {info.height}</p>
      <p>{formatFileSize(info.size)}</p>
      <p>{formatMimeType(info.mimeType)}</p>
      {typeof reduction === "number" ? <p>Reduced by {reduction}%</p> : null}
    </div>
  );
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function formatMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") return "JPEG";
  if (mimeType === "image/png") return "PNG";
  if (mimeType === "image/webp") return "WebP";
  return mimeType;
}

function reduction(originalSize: number, processedSize: number) {
  if (originalSize <= 0 || processedSize >= originalSize) return null;
  return Math.round((1 - processedSize / originalSize) * 100);
}
