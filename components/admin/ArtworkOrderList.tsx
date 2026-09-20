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
    <form action={reorderArtworks} className="grid min-w-0 gap-6">
      <input type="hidden" name="ids" value={items.map((item) => item.id).join(",")} />
      <div className="grid min-w-0 gap-3 lg:grid-cols-3 lg:gap-5">
        {items.map((artwork, index) => {
          const primary = artwork.images.find((image) => image.is_primary) ?? artwork.images[0];
          const isDragged = dragged === artwork.id;

          return (
            <div
              key={artwork.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                setDragged(artwork.id);
              }}
              onDragEnd={() => setDragged(null)}
              onDragOver={(event) => {
                event.preventDefault();
                move(artwork.id);
              }}
              className={`relative flex min-w-0 cursor-grab items-center gap-3 border bg-[#F2EDD5] p-3 active:cursor-grabbing lg:block lg:p-4 ${
                isDragged ? "border-[#E7390D] opacity-55" : "border-[#084A24]/25"
              }`}
            >
              <div className="flex shrink-0 items-center gap-1 text-[#084A24] lg:absolute lg:left-6 lg:top-6 lg:z-20 lg:bg-[#F2EDD5]/90 lg:px-2 lg:py-1">
                <GripVertical size={18} aria-hidden />
                <span className="hidden text-xs font-semibold lg:inline">{index + 1}</span>
              </div>
              {primary ? (
                <ArtworkImageFrame
                  image={primary}
                  alt={primary.alt_text}
                  className="h-16 w-20 shrink-0 lg:h-auto lg:w-full"
                  foregroundClassName="!p-1 lg:!p-2"
                />
              ) : (
                <div className="h-16 w-20 shrink-0 bg-[#F26716]/20 lg:aspect-[4/3] lg:h-auto lg:w-full" aria-hidden />
              )}
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:mt-3 lg:items-start lg:justify-between">
                <span className="min-w-0 truncate font-medium">{artwork.title}</span>
                <span className="ml-auto shrink-0 text-sm text-[#084A24] lg:ml-0">{formatArtworkStatus(artwork.status)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <button className="button button-secondary justify-self-start">
        <Save size={18} aria-hidden />
        Save order
      </button>
    </form>
  );
}
