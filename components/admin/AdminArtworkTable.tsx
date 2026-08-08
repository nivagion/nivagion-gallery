"use client";

import Link from "next/link";
import { Copy, Pencil, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { bulkUpdateArtworkStatus, duplicateArtworkAction } from "../../app/admin/actions";
import { formatArtworkStatus, selectableArtworkStatuses } from "../../lib/artwork-status";
import { formatMoney } from "../../lib/format";
import type { ArtworkWithImages } from "../../lib/types";
import { ArtworkImageFrame } from "../public/ArtworkImageFrame";
import { DeleteArtworkButton } from "./DeleteArtworkButton";

export function AdminArtworkTable({ artworks }: { artworks: ArtworkWithImages[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = artworks.length > 0 && selectedIds.length === artworks.length;

  function toggle(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : artworks.map((artwork) => artwork.id));
  }

  return (
    <section className="grid gap-4">
      <form action={bulkUpdateArtworkStatus} className="flex flex-wrap items-end gap-3 border border-[#084A24]/25 bg-[#F2EDD5] p-4">
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
        <div className="grid gap-1">
          <label className="text-xs uppercase tracking-[0.08em] text-[#084A24]" htmlFor="bulk-status">
            Selected status
          </label>
          <select id="bulk-status" name="status" className="field min-w-48" defaultValue="available">
            {selectableArtworkStatuses.map((option) => (
              <option key={option} value={option}>
                {formatArtworkStatus(option)}
              </option>
            ))}
          </select>
        </div>
        <button className="button button-secondary" disabled={!selectedIds.length}>
          <RefreshCw size={18} aria-hidden />
          Update {selectedIds.length || ""} selected
        </button>
        <button type="button" className="button button-secondary" onClick={toggleAll} disabled={!artworks.length}>
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#084A24]/25 text-[#084A24]">
              <th className="py-3 pr-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? "Deselect all artworks" : "Select all artworks"}
                />
              </th>
              <th className="py-3 pr-4">Artwork</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Price</th>
              <th className="py-3 pr-4">Published</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map((artwork) => {
              const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
              return (
                <tr key={artwork.id} className="border-b border-[#084A24]/25 align-top">
                  <td className="py-4 pr-4">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(artwork.id)}
                      onChange={() => toggle(artwork.id)}
                      aria-label={`Select ${artwork.title}`}
                    />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {primary ? (
                        <ArtworkImageFrame image={primary} className="h-16 w-14" foregroundClassName="!p-1" />
                      ) : (
                        <div className="h-16 w-14 bg-[#F26716]/20" />
                      )}
                      <div>
                        <Link href={`/admin/artworks/${artwork.id}`} className="font-semibold underline-offset-4 hover:underline">
                          {artwork.title}
                        </Link>
                        <p className="text-[#084A24]">{artwork.medium}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{formatArtworkStatus(artwork.status)}</td>
                  <td className="py-4 pr-4">{formatMoney(artwork.price_cents, artwork.currency)}</td>
                  <td className="py-4 pr-4">{artwork.is_published ? "Yes" : "No"}</td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/artworks/${artwork.id}`} className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Edit artwork details, price and description">
                        <Pencil size={16} aria-hidden />
                      </Link>
                      <form action={duplicateArtworkAction}>
                        <input type="hidden" name="id" value={artwork.id} />
                        <button className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]" title="Duplicate artwork">
                          <Copy size={16} aria-hidden />
                        </button>
                      </form>
                      <DeleteArtworkButton artworkId={artwork.id} title={artwork.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!artworks.length ? <p className="border border-[#084A24]/25 p-6 text-[#084A24]">No artworks yet.</p> : null}
      </div>
    </section>
  );
}
