import { getArtworkBucket } from "./db/client";
import type { ArtworkImage } from "./types";

const maxFileSizeMb = 95;
const maxFileSize = maxFileSizeMb * 1024 * 1024;
const signatures = {
  jpeg: { mime: "image/jpeg", ext: "jpg" },
  png: { mime: "image/png", ext: "png" },
  webp: { mime: "image/webp", ext: "webp" },
  avif: { mime: "image/avif", ext: "avif" },
} as const;

type ImageKind = (typeof signatures)[keyof typeof signatures];
type ImageMetadata = ImageKind & {
  width: number | null;
  height: number | null;
};

export function imageUrl(objectKey: string, version?: string | number | null) {
  const path = objectKey.startsWith("/")
    ? objectKey
    : `/images/${encodeURIComponent(objectKey).replace(/%2F/g, "/")}`;
  if (!version) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${encodeURIComponent(String(version))}`;
}

export function artworkImageUrl(image: Pick<ArtworkImage, "object_key" | "file_size" | "created_at">) {
  return imageUrl(image.object_key, `${image.file_size}-${image.created_at}`);
}

export async function validateImageFile(file: File) {
  if (file.size <= 0 || file.size > maxFileSize) {
    throw new Error(`Images must be between 1 byte and ${maxFileSizeMb} MB.`);
  }
  const buffer = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  return validateImageBuffer(buffer, file.type);
}

export async function putArtworkImage(key: string, file: File) {
  const bucket = getArtworkBucket();
  if (!bucket) throw new Error("R2 bucket binding is required for image uploads.");
  if (file.size <= 0 || file.size > maxFileSize) {
    throw new Error(`Images must be between 1 byte and ${maxFileSizeMb} MB.`);
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const metadata = validateImageBuffer(bytes, file.type);
  await bucket.put(key, buffer, {
    httpMetadata: {
      contentType: metadata.mime,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      originalName: file.name,
    },
  });
  return metadata;
}

export async function deleteArtworkObject(key: string) {
  const bucket = getArtworkBucket();
  if (!bucket || key.startsWith("/")) return;
  await bucket.delete(key);
}

function validateImageBuffer(buffer: Uint8Array, declaredType?: string): ImageMetadata {
  const kind = detectImageKind(buffer);
  if (!kind) throw new Error("Upload a JPEG, PNG, WebP or AVIF image.");
  if (declaredType && declaredType !== kind.mime) {
    throw new Error("The file content does not match its declared image type.");
  }
  const dimensions = readImageDimensions(buffer, kind.mime);
  return { ...kind, ...dimensions };
}

function detectImageKind(buffer: Uint8Array): ImageKind | null {
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

function readImageDimensions(buffer: Uint8Array, mime: string) {
  if (mime === "image/png") return readPngDimensions(buffer);
  if (mime === "image/jpeg") return readJpegDimensions(buffer);
  if (mime === "image/webp") return readWebpDimensions(buffer);
  return { width: null, height: null };
}

function readPngDimensions(buffer: Uint8Array) {
  if (buffer.length < 24) return { width: null, height: null };
  return {
    width: readUint32BE(buffer, 16),
    height: readUint32BE(buffer, 20),
  };
}

function readJpegDimensions(buffer: Uint8Array) {
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buffer.length) break;
    const length = readUint16BE(buffer, offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (isJpegStartOfFrame(marker) && length >= 7) {
      return {
        height: readUint16BE(buffer, offset + 3),
        width: readUint16BE(buffer, offset + 5),
      };
    }
    offset += length;
  }
  return { width: null, height: null };
}

function readWebpDimensions(buffer: Uint8Array) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = ascii(buffer.slice(offset, offset + 4));
    const chunkSize = readUint32LE(buffer, offset + 4);
    const payload = offset + 8;
    if (payload + chunkSize > buffer.length) break;
    if (chunkType === "VP8X" && chunkSize >= 10) {
      return {
        width: readUint24LE(buffer, payload + 4) + 1,
        height: readUint24LE(buffer, payload + 7) + 1,
      };
    }
    if (chunkType === "VP8 " && chunkSize >= 10 && buffer[payload + 3] === 0x9d && buffer[payload + 4] === 0x01 && buffer[payload + 5] === 0x2a) {
      return {
        width: readUint16LE(buffer, payload + 6) & 0x3fff,
        height: readUint16LE(buffer, payload + 8) & 0x3fff,
      };
    }
    if (chunkType === "VP8L" && chunkSize >= 5 && buffer[payload] === 0x2f) {
      const bits = buffer[payload + 1] | (buffer[payload + 2] << 8) | (buffer[payload + 3] << 16) | (buffer[payload + 4] << 24);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    offset = payload + chunkSize + (chunkSize % 2);
  }
  return { width: null, height: null };
}

function isJpegStartOfFrame(marker: number) {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function readUint16BE(buffer: Uint8Array, offset: number) {
  return (buffer[offset] << 8) + buffer[offset + 1];
}

function readUint16LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] + (buffer[offset + 1] << 8);
}

function readUint24LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function readUint32BE(buffer: Uint8Array, offset: number) {
  return (buffer[offset] * 0x1000000) + ((buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3]);
}

function readUint32LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16) + (buffer[offset + 3] * 0x1000000);
}

function ascii(bytes: Uint8Array) {
  return String.fromCharCode(...bytes);
}
