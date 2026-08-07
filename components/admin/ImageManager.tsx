"use client";

import { GripVertical, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { ArtworkImageFrame } from "../public/ArtworkImageFrame";
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
    return <p className="border border-[#084A24]/25 p-4 text-sm text-[#084A24]">No images uploaded yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {message ? <p className="text-sm text-[#084A24]">{message}</p> : null}
      {items.map((image) => (
        <figure
          key={image.id}
          draggable
          onDragStart={() => setDragged(image.id)}
          onDragOver={(event) => {
            event.preventDefault();
            move(image.id);
          }}
          className="border border-[#084A24]/25 bg-[#F2EDD5] p-3"
        >
          <ArtworkImageFrame image={image} alt={image.alt_text} foregroundClassName="!p-2" />
          <figcaption className="mt-3 grid gap-3 text-sm text-[#084A24]">
            <span>{image.is_primary ? "Primary · " : ""}{image.alt_text}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]"
                title="Drag to reorder image"
                onClick={() => request({ action: "reorder", ids: items.map((item) => item.id) })}
              >
                <GripVertical size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]"
                title="Set primary image"
                onClick={() => request({ action: "primary", imageId: image.id })}
              >
                <Star size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="border border-[#084A24]/25 p-2 hover:border-[#E7390D]"
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
