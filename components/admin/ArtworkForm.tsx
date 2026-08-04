"use client";

import { useActionState, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { saveArtwork } from "../../app/admin/actions";
import { slugify } from "../../lib/slug";
import type { ArtworkWithImages } from "../../lib/types";

export function ArtworkForm({ artwork }: { artwork?: ArtworkWithImages }) {
  const [state, action, pending] = useActionState(saveArtwork, null);
  const [title, setTitle] = useState(artwork?.title ?? "");
  const generatedSlug = useMemo(() => slugify(title), [title]);

  return (
    <form action={action} className="grid gap-6">
      {state?.message ? <p className="border border-[#d7d0c5] p-3 text-sm text-[#4b4741]">{state.message}</p> : null}
      {artwork ? <input type="hidden" name="id" value={artwork.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Title
          <input className="field" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label className="label">
          Slug
          <input className="field" name="slug" defaultValue={artwork?.slug ?? ""} placeholder={generatedSlug} />
        </label>
      </div>
      <label className="label">
        Subtitle
        <input className="field" name="subtitle" defaultValue={artwork?.subtitle ?? ""} />
      </label>
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
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Width cm
          <input className="field" name="width_cm" inputMode="decimal" defaultValue={artwork?.width_cm ?? ""} />
        </label>
        <label className="label">
          Height cm
          <input className="field" name="height_cm" inputMode="decimal" defaultValue={artwork?.height_cm ?? ""} />
        </label>
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
        <input className="field" name="revolut_payment_url" type="url" defaultValue={artwork?.revolut_payment_url ?? ""} placeholder="https://revolut.me/..." />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Status
          <select className="field" name="status" defaultValue={artwork?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="flex items-center gap-3 border border-[#d7d0c5] bg-[#f8f4ed] px-4 py-3">
          <input type="checkbox" name="is_published" defaultChecked={artwork?.is_published ?? false} />
          Published
        </label>
        <label className="flex items-center gap-3 border border-[#d7d0c5] bg-[#f8f4ed] px-4 py-3">
          <input type="checkbox" name="is_featured" defaultChecked={artwork?.is_featured ?? false} />
          Featured
        </label>
      </div>
      <button className="button justify-self-start" disabled={pending}>
        <Save size={18} aria-hidden />
        {pending ? "Saving" : "Save artwork"}
      </button>
    </form>
  );
}
