"use client";

import { Images, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { altTextFromFilename } from "../../lib/batch-artworks";
import { processArtworkImage, type ProcessedArtworkImage } from "../../lib/client/process-artwork-image";
import { formatArtworkStatus, selectableArtworkStatuses } from "../../lib/artwork-status";

const paperSizes = {
  a3: { label: "A3", width: "29.7", height: "42" },
  a4: { label: "A4", width: "21", height: "29.7" },
  a5: { label: "A5", width: "14.8", height: "21" },
} as const;

type BatchImage = ProcessedArtworkImage & {
  id: string;
  altText: string;
  previewUrl: string;
};

type PaperSize = keyof typeof paperSizes;

export function BulkArtworkUploadForm() {
  const router = useRouter();
  const [items, setItems] = useState<BatchImage[]>([]);
  const [paperSize, setPaperSize] = useState<PaperSize | "custom">("custom");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      for (const item of items) URL.revokeObjectURL(item.previewUrl);
    };
  }, [items]);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    setProcessing(true);
    setProcessedCount(0);
    setMessage("");
    setError("");

    const nextItems: BatchImage[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const processed = await processArtworkImage(file);
        nextItems.push({
          ...processed,
          id: `${file.name}-${file.lastModified}-${index}-${processed.file.size}`,
          altText: altTextFromFilename(file.name),
          previewUrl: URL.createObjectURL(processed.file),
        });
        setProcessedCount(index + 1);
      }
      setItems((current) => [...current, ...nextItems]);
    } catch (caught) {
      for (const item of nextItems) URL.revokeObjectURL(item.previewUrl);
      setError(caught instanceof Error ? caught.message : "Image processing failed.");
    } finally {
      setProcessing(false);
    }
  }

  function removeItem(id: string) {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function updateAltText(id: string, altText: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, altText } : item)));
  }

  function choosePaperSize(value: PaperSize | "custom") {
    setPaperSize(value);
    if (value === "custom") return;
    setWidthCm(paperSizes[value].width);
    setHeightCm(paperSizes[value].height);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing) {
      setMessage("Wait for image processing to finish.");
      return;
    }
    if (!items.length) {
      setMessage("Add at least one image.");
      return;
    }

    setPending(true);
    setMessage("");
    setError("");
    try {
      const form = event.currentTarget;
      const source = new FormData(form);
      const body = new FormData();
      for (const name of [
        "year",
        "medium",
        "surface",
        "width_cm",
        "height_cm",
        "price_eur",
        "currency",
        "description",
        "revolut_payment_url",
        "status",
      ]) {
        body.set(name, source.get(name) ?? "");
      }
      if (source.has("is_published")) body.set("is_published", "on");
      for (const item of items) {
        body.append("files", item.file, item.processed.filename);
        body.append("altTexts", item.altText);
      }

      const response = await fetch("/admin/api/artworks/bulk", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Batch creation failed.");
      setMessage(result.message ?? "Created artworks.");
      for (const item of items) URL.revokeObjectURL(item.previewUrl);
      setItems([]);
      form.reset();
      setPaperSize("custom");
      setWidthCm("");
      setHeightCm("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Batch creation failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8">
      {message ? <p className="border border-[#084A24]/25 p-3 text-sm text-[#04261E]">{message}</p> : null}
      {error ? <p className="border border-[#E7390D]/40 p-3 text-sm text-[#E7390D]">{error}</p> : null}
      <label
        className="grid cursor-pointer justify-items-center gap-3 border border-dashed border-[#084A24]/40 bg-[#F2EDD5] p-8 text-center hover:border-[#E7390D]"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void addFiles(event.dataTransfer.files);
        }}
      >
        <Images size={28} aria-hidden />
        <span className="font-medium">Drop artwork images here</span>
        <span className="text-sm text-[#084A24]">JPEG, PNG, or WebP. Each image becomes one artwork.</span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => void addFiles(event.currentTarget.files ?? [])}
        />
      </label>

      {processing ? <p className="text-sm text-[#084A24]">Preparing {processedCount} images...</p> : null}

      {items.length ? (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="editorial-title text-2xl">{items.length} artworks queued</h2>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                for (const item of items) URL.revokeObjectURL(item.previewUrl);
                setItems([]);
              }}
            >
              <Trash2 size={18} aria-hidden />
              Clear
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <figure key={item.id} className="grid gap-3 border border-[#084A24]/25 bg-[#F2EDD5] p-3">
                <img src={item.previewUrl} alt="" className="aspect-[4/5] w-full object-contain" />
                <label className="label">
                  Image text
                  <input
                    className="field"
                    value={item.altText}
                    onChange={(event) => updateAltText(item.id, event.target.value)}
                    required
                  />
                </label>
                <div className="grid gap-1 text-sm text-[#084A24]">
                  <p>{item.original.filename}</p>
                  <p>
                    {item.original.width} x {item.original.height} to {item.processed.width} x {item.processed.height}
                  </p>
                  <p>
                    {formatFileSize(item.original.size)} to {formatFileSize(item.processed.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]"
                  title="Remove image"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 border border-[#084A24]/25 bg-[#F2EDD5] p-5">
        <h2 className="editorial-title text-2xl">Defaults</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="label">
            Year
            <input className="field" name="year" inputMode="numeric" />
          </label>
          <label className="label">
            Medium
            <input className="field" name="medium" defaultValue="Marker" required />
          </label>
          <label className="label">
            Surface
            <input className="field" name="surface" />
          </label>
          <label className="label">
            Price EUR
            <input className="field" name="price_eur" inputMode="decimal" />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-[14rem_1fr_1fr]">
          <label className="label">
            Paper size
            <select
              className="field"
              value={paperSize}
              onChange={(event) => choosePaperSize(event.target.value as PaperSize | "custom")}
            >
              <option value="custom">Custom</option>
              {Object.entries(paperSizes).map(([value, size]) => (
                <option key={value} value={value}>
                  {size.label}
                </option>
              ))}
            </select>
          </label>
          <label className="label">
            Width cm
            <input
              className="field"
              name="width_cm"
              inputMode="decimal"
              value={widthCm}
              onChange={(event) => {
                setWidthCm(event.target.value);
                setPaperSize("custom");
              }}
            />
          </label>
          <label className="label">
            Height cm
            <input
              className="field"
              name="height_cm"
              inputMode="decimal"
              value={heightCm}
              onChange={(event) => {
                setHeightCm(event.target.value);
                setPaperSize("custom");
              }}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Currency
            <input className="field" name="currency" defaultValue="EUR" />
          </label>
          <label className="label">
            Status
            <select className="field" name="status" defaultValue="draft">
              {selectableArtworkStatuses.map((option) => (
                <option key={option} value={option}>
                  {formatArtworkStatus(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="label">
          Default description
          <textarea className="field min-h-36" name="description" />
        </label>
        <label className="label">
          Revolut payment URL
          <input className="field" name="revolut_payment_url" type="url" />
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" name="is_published" />
          Publish created artworks
        </label>
      </section>

      <button className="button justify-self-start" disabled={pending || processing || !items.length}>
        <Upload size={18} aria-hidden />
        {processing ? "Preparing" : pending ? "Creating" : `Create ${items.length || ""} artworks`}
      </button>
    </form>
  );
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}
