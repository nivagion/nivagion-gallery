"use client";

import { Trash2 } from "lucide-react";
import { deleteArtworkAction } from "../../app/admin/actions";

export function DeleteArtworkButton({ artworkId, title }: { artworkId: string; title: string }) {
  return (
    <form
      action={deleteArtworkAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={artworkId} />
      <button className="border border-[#084A24]/25 p-2 text-[#E7390D] hover:border-[#E7390D]" title="Delete artwork">
        <Trash2 size={16} aria-hidden />
      </button>
    </form>
  );
}
