"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { saveArtwork } from "../../app/admin/actions";
import { formatArtworkStatus, selectableArtworkStatuses } from "../../lib/artwork-status";
import type { ArtworkWithImages } from "../../lib/types";

const paperSizes = {
  a3: { label: "A3", width: "29.7", height: "42" },
  a4: { label: "A4", width: "21", height: "29.7" },
  a5: { label: "A5", width: "14.8", height: "21" },
} as const;

type PaperSize = keyof typeof paperSizes;

export function ArtworkForm({ artwork }: { artwork?: ArtworkWithImages }) {
  const [state, action, pending] = useActionState(saveArtwork, null);
  const [title, setTitle] = useState(artwork?.title ?? "");
  const [widthCm, setWidthCm] = useState(artwork?.width_cm ? String(artwork.width_cm) : "");
  const [heightCm, setHeightCm] = useState(artwork?.height_cm ? String(artwork.height_cm) : "");
  const [paperSize, setPaperSize] = useState<PaperSize | "custom">(initialPaperSize(artwork?.width_cm, artwork?.height_cm));
  const status = artwork?.status === "archived" ? "draft" : artwork?.status ?? "available";

  function choosePaperSize(value: PaperSize | "custom") {
    setPaperSize(value);
    if (value === "custom") return;
    setWidthCm(paperSizes[value].width);
    setHeightCm(paperSizes[value].height);
  }

  return (
    <form action={action} className="grid gap-6">
      {state?.message ? <p className="border border-[#084A24]/25 p-3 text-sm text-[#04261E]">{state.message}</p> : null}
      {artwork ? <input type="hidden" name="id" value={artwork.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Title
          <input className="field" name="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="label">
          Year
          <input className="field" name="year" inputMode="numeric" defaultValue={artwork?.year ?? ""} />
        </label>
        <label className="label">
          Medium
          <input className="field" name="medium" defaultValue={artwork?.medium ?? "Marker"} required />
        </label>
        <label className="label">
          Surface
          <input className="field" name="surface" defaultValue={artwork?.surface ?? ""} />
        </label>
        <label className="label">
          Price EUR
          <input className="field" name="price_eur" inputMode="decimal" defaultValue={artwork?.price_cents ? artwork.price_cents / 100 : ""} />
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
          <input className="field" name="currency" defaultValue={artwork?.currency ?? "EUR"} />
        </label>
      </div>
      <label className="label">
        Description
        <textarea className="field min-h-36" name="description" defaultValue={artwork?.description ?? ""} />
      </label>
      <label className="label">
        Revolut payment URL
        <input className="field" name="revolut_payment_url" type="url" defaultValue={artwork?.revolut_payment_url ?? ""} />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Status
          <select className="field" name="status" defaultValue={status}>
            {selectableArtworkStatuses.map((option) => (
              <option key={option} value={option}>
                {formatArtworkStatus(option)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="button justify-self-start" disabled={pending}>
        <Save size={18} aria-hidden />
        {pending ? "Saving" : "Save artwork"}
      </button>
    </form>
  );
}

function initialPaperSize(width?: number | null, height?: number | null): PaperSize | "custom" {
  const currentWidth = width ? String(width) : "";
  const currentHeight = height ? String(height) : "";
  const match = Object.entries(paperSizes).find(
    ([, size]) => size.width === currentWidth && size.height === currentHeight
  );
  return (match?.[0] as PaperSize | undefined) ?? "custom";
}
