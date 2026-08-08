import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/admin/api/artworks/bulk/route";

const mocks = vi.hoisted(() => ({
  ids: ["art_1", "img_1", "art_2", "img_2"],
  upsertArtwork: vi.fn(),
  insertArtworkImage: vi.fn(),
  deleteArtworkById: vi.fn(),
  putArtworkImage: vi.fn(),
  deleteArtworkObject: vi.fn(),
  validateProcessedArtworkImageFile: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("../lib/security", () => ({
  requireAdmin: vi.fn(),
  assertSameOrigin: vi.fn(),
}));

vi.mock("../lib/db/client", () => ({
  id: () => mocks.ids.shift(),
}));

vi.mock("../lib/db/artworks", () => ({
  upsertArtwork: mocks.upsertArtwork,
  insertArtworkImage: mocks.insertArtworkImage,
  deleteArtworkById: mocks.deleteArtworkById,
}));

vi.mock("../lib/images", async () => {
  const actual = await vi.importActual<typeof import("../lib/images")>("../lib/images");
  return {
    ...actual,
    putArtworkImage: mocks.putArtworkImage,
    deleteArtworkObject: mocks.deleteArtworkObject,
    validateProcessedArtworkImageFile: mocks.validateProcessedArtworkImageFile,
  };
});

describe("bulk artwork upload route", () => {
  beforeEach(() => {
    mocks.ids = ["art_1", "img_1", "art_2", "img_2"];
    mocks.upsertArtwork.mockReset();
    mocks.insertArtworkImage.mockReset();
    mocks.deleteArtworkById.mockReset().mockResolvedValue([]);
    mocks.putArtworkImage.mockReset();
    mocks.deleteArtworkObject.mockReset();
    mocks.validateProcessedArtworkImageFile.mockReset().mockResolvedValue({
      width: 2800,
      height: 2100,
      mime: "image/webp",
      ext: "webp",
    });
    mocks.revalidatePath.mockReset();
  });

  it("creates one unnamed artwork and one unique WebP image key per file", async () => {
    const form = new FormData();
    form.set("medium", "Marker");
    form.set("status", "available");
    form.set("currency", "EUR");
    form.set("is_published", "on");
    form.append("files", new File([new Uint8Array([1])], "one.webp", { type: "image/webp" }));
    form.append("files", new File([new Uint8Array([2])], "two.webp", { type: "image/webp" }));
    form.append("altTexts", "One");
    form.append("altTexts", "Two");

    const response = await POST(new Request("https://example.test/admin/api/artworks/bulk", {
      method: "POST",
      body: form,
    }));
    const body = (await response.json()) as { message: string; count: number };

    expect(response.status).toBe(200);
    expect(body.count).toBe(2);
    expect(mocks.putArtworkImage).toHaveBeenNthCalledWith(1, "artworks/art_1/img_1.webp", expect.any(File));
    expect(mocks.putArtworkImage).toHaveBeenNthCalledWith(2, "artworks/art_2/img_2.webp", expect.any(File));
    expect(mocks.upsertArtwork).toHaveBeenCalledTimes(2);
    expect(mocks.upsertArtwork).toHaveBeenNthCalledWith(1, expect.objectContaining({
      id: "art_1",
      title: "Unnamed artwork",
      slug: "unnamed-artwork-art-1",
      medium: "Marker",
      is_published: true,
    }));
    expect(mocks.insertArtworkImage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      id: "img_2",
      artwork_id: "art_2",
      object_key: "artworks/art_2/img_2.webp",
      alt_text: "Two",
      is_primary: true,
      file_type: "image/webp",
    }));
  });
});
