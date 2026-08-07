"use client";

import { GripVertical, Save } from "lucide-react";
import { useState } from "react";
import { reorderArtworks } from "../../app/admin/actions";
import { ArtworkImageFrame } from "../public/ArtworkImageFrame";
import { formatArtworkStatus } from "../../lib/artwork-status";
import type { ArtworkWithImages } from "../../lib/types";

export function ArtworkOrderList({ artworks }: { artworks: ArtworkWithImages[] }) {
  const [items, setItems] = useState(artworks);
  const [dragged, setDragged] = useState<string | null>(null);

  function move(targetId: string) {
    if (!dragged || dragged === targetId) return;
    const current = [...items];
    const from = current.findIndex((item) => item.id === dragged);
    const to = current.findIndex((item) => item.id === targetId);
    const [item] = current.splice(from, 1);
    current.splice(to, 0, item);
    setItems(current);
  }

  return (
    <form action={reorderArtworks} className="grid gap-3">
      <input type="hidden" name="ids" value={items.map((item) => item.id).join(",")} />
      {items.map((artwork) => {
        const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
        return (
          <div
            key={artwork.id}
            draggable
            onDragStart={() => setDragged(artwork.id)}
            onDragOver={(event) => {
              event.preventDefault();
              move(artwork.id);
            }}
            className="flex items-center gap-3 border border-[#084A24]/25 bg-[#F2EDD5] p-3"
          >
            <GripVertical size={18} aria-hidden />
            {primary ? (
              <ArtworkImageFrame image={primary} className="h-14 w-14" foregroundClassName="!p-1" />
            ) : (
              <div className="h-14 w-14 bg-[#F26716]/20" aria-hidden />
            )}
            <span className="font-medium">{artwork.title}</span>
            <span className="ml-auto text-sm text-[#084A24]">{formatArtworkStatus(artwork.status)}</span>
          </div>
        );
      })}
      <button className="button button-secondary justify-self-start">
        <Save size={18} aria-hidden />
        Save order
      </button>
    </form>
  );
}
