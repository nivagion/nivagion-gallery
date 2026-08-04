import { getArtworkBucket } from "./db/client";

const maxFileSize = 10 * 1024 * 1024;
const signatures = {
  jpeg: { mime: "image/jpeg", ext: "jpg" },
  png: { mime: "image/png", ext: "png" },
  webp: { mime: "image/webp", ext: "webp" },
  avif: { mime: "image/avif", ext: "avif" },
} as const;

export function imageUrl(objectKey: string) {
  if (objectKey.startsWith("/")) return objectKey;
  return `/images/${encodeURIComponent(objectKey).replace(/%2F/g, "/")}`;
}

export async function validateImageFile(file: File) {
  if (file.size <= 0 || file.size > maxFileSize) {
    throw new Error("Images must be between 1 byte and 10 MB.");
  }
  const buffer = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const kind = detectImageKind(buffer);
  if (!kind) throw new Error("Upload a JPEG, PNG, WebP or AVIF image.");
  if (file.type && file.type !== kind.mime) {
    throw new Error("The file content does not match its declared image type.");
  }
  return kind;
}

export async function putArtworkImage(key: string, file: File) {
  const bucket = getArtworkBucket();
  if (!bucket) throw new Error("R2 bucket binding is required for image uploads.");
  const kind = await validateImageFile(file);
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: kind.mime,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      originalName: file.name,
    },
  });
  return kind;
}

export async function deleteArtworkObject(key: string) {
  const bucket = getArtworkBucket();
  if (!bucket || key.startsWith("/")) return;
  await bucket.delete(key);
}

function detectImageKind(buffer: Uint8Array) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return signatures.jpeg;
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return signatures.png;
  }
  if (
    ascii(buffer.slice(0, 4)) === "RIFF" &&
    ascii(buffer.slice(8, 12)) === "WEBP"
  ) {
    return signatures.webp;
  }
  if (
    ascii(buffer.slice(4, 8)) === "ftyp" &&
    ["avif", "avis"].includes(ascii(buffer.slice(8, 12)))
  ) {
    return signatures.avif;
  }
  return null;
}

function ascii(bytes: Uint8Array) {
  return String.fromCharCode(...bytes);
}
