import { afterEach, describe, expect, it, vi } from "vitest";
import {
  artworkImageObjectKey,
  imageUrl,
  validateImageFile,
  validateProcessedArtworkImageFile,
} from "../lib/images";

describe("image validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts PNG content with matching MIME type", async () => {
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "x.png", {
      type: "image/png",
    });
    await expect(validateImageFile(png)).resolves.toMatchObject({ mime: "image/png" });
  });

  it("rejects misleading executable content", async () => {
    const exe = new File([new TextEncoder().encode("MZ fake")], "x.png", {
      type: "image/png",
    });
    await expect(validateImageFile(exe)).rejects.toThrow(/JPEG, PNG, WebP or AVIF/);
  });

  it("builds production media URLs by encoding each R2 key segment", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE_URL", "https://media.nivagion.com/");

    expect(imageUrl("artworks/art 1/img#1.webp?ignored=1", "cache")).toBe(
      "https://media.nivagion.com/artworks/art%201/img%231.webp"
    );
  });

  it("keeps local image route behavior when no media base URL is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE_URL", "");

    expect(imageUrl("artworks/art 1/img#1.webp", "cache")).toBe(
      "/images/artworks/art%201/img%231.webp?v=cache"
    );
  });

  it("keeps local image route behavior during next dev even when wrangler has media config", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_MEDIA_BASE_URL", "https://media.nivagion.com");

    expect(imageUrl("artworks/demo/img.webp", "cache")).toBe(
      "/images/artworks/demo/img.webp?v=cache"
    );
  });

  it("generates new WebP artwork object keys", () => {
    expect(artworkImageObjectKey("art_123", "img_456")).toBe("artworks/art_123/img_456.webp");
  });

  it("accepts processed WebP uploads with matching content", async () => {
    const webp = new File([makeWebp(400, 300)], "x.webp", { type: "image/webp" });

    await expect(validateProcessedArtworkImageFile(webp)).resolves.toMatchObject({
      mime: "image/webp",
      width: 400,
      height: 300,
    });
  });

  it("rejects non-WebP processed uploads", async () => {
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "x.png", {
      type: "image/png",
    });

    await expect(validateProcessedArtworkImageFile(png)).rejects.toThrow(/WebP/);
  });
});

function makeWebp(width: number, height: number) {
  const bytes = new Uint8Array(30);
  bytes.set(ascii("RIFF"), 0);
  bytes.set(uint32LE(22), 4);
  bytes.set(ascii("WEBP"), 8);
  bytes.set(ascii("VP8X"), 12);
  bytes.set(uint32LE(10), 16);
  writeUint24LE(bytes, 24, width - 1);
  writeUint24LE(bytes, 27, height - 1);
  return bytes;
}

function ascii(value: string) {
  return Uint8Array.from(value.split("").map((char) => char.charCodeAt(0)));
}

function uint32LE(value: number) {
  return Uint8Array.from([
    value & 0xff,
    (value >> 8) & 0xff,
    (value >> 16) & 0xff,
    (value >> 24) & 0xff,
  ]);
}

function writeUint24LE(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
}
