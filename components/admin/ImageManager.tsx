"use client";

import { GripVertical, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { imageUrl } from "../../lib/images";
import type { ArtworkImage } from "../../lib/types";

export function ImageManager({ artworkId, images }: { artworkId: string; images: ArtworkImage[] }) {
  const [items, setItems] = useState(images);
  const [dragged, setDragged] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function request(body: object, method = "PATCH") {
    const response = await fetch(`/admin/api/artworks/${artworkId}/images`, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { message?: string };
    setMessage(result.message ?? "");
    if (response.ok) window.location.reload();
  }

  function move(targetId: string) {
    if (!dragged || dragged === targetId) return;
    const next = [...items];
    const from = next.findIndex((image) => image.id === dragged);
    const to = next.findIndex((image) => image.id === targetId);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  }

  if (!items.length) {
    return <p className="border border-[#d7d0c5] p-4 text-sm text-[#746f67]">No images uploaded yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {message ? <p className="text-sm text-[#746f67]">{message}</p> : null}
      {items.map((image) => (
        <figure
          key={image.id}
          draggable
          onDragStart={() => setDragged(image.id)}
          onDragOver={(event) => {
            event.preventDefault();
            move(image.id);
          }}
          className="border border-[#d7d0c5] bg-[#f8f4ed] p-3"
        >
          <img src={imageUrl(image.object_key)} alt={image.alt_text} className="aspect-[4/5] w-full object-cover" />
          <figcaption className="mt-3 grid gap-3 text-sm text-[#746f67]">
            <span>{image.is_primary ? "Primary · " : ""}{image.alt_text}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="border border-[#d7d0c5] p-2 hover:border-[#181614]"
                title="Drag to reorder image"
                onClick={() => request({ action: "reorder", ids: items.map((item) => item.id) })}
              >
                <GripVertical size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="border border-[#d7d0c5] p-2 hover:border-[#181614]"
                title="Set primary image"
                onClick={() => request({ action: "primary", imageId: image.id })}
              >
                <Star size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="border border-[#d7d0c5] p-2 hover:border-[#181614]"
                title="Delete image"
                onClick={() => {
                  if (window.confirm("Delete this image?")) request({ imageId: image.id }, "DELETE");
                }}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
