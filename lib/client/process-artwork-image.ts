export const maxArtworkImageEdge = 2800;
export const artworkWebpQuality = 0.9;

const acceptedSourceTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ImageInfo = {
  width: number;
  height: number;
  size: number;
  mimeType: string;
  filename: string;
};

export type ProcessedArtworkImage = {
  file: File;
  original: ImageInfo;
  processed: ImageInfo;
};

export function resizeToMaxEdge(width: number, height: number, maxEdge = maxArtworkImageEdge) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Image dimensions are invalid.");
  }
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxEdge) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxEdge / longestEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function processArtworkImage(file: File): Promise<ProcessedArtworkImage> {
  if (!acceptedSourceTypes.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  const bitmap = await decodeImage(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const target = resizeToMaxEdge(originalWidth, originalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext("2d", {
    alpha: file.type === "image/png" || file.type === "image/webp",
  });
  if (!context) {
    bitmap.close();
    throw new Error("This browser could not prepare the image canvas.");
  }

  context.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas, "image/webp", artworkWebpQuality);
  if (!blob || blob.size <= 0 || blob.type !== "image/webp") {
    throw new Error("WebP conversion failed. Try a different source image.");
  }

  const filename = webpFilename(file.name);
  const processedFile = new File([blob], filename, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  return {
    file: processedFile,
    original: {
      width: originalWidth,
      height: originalHeight,
      size: file.size,
      mimeType: file.type,
      filename: file.name,
    },
    processed: {
      width: target.width,
      height: target.height,
      size: processedFile.size,
      mimeType: processedFile.type,
      filename,
    },
  };
}

function decodeImage(file: File) {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

function webpFilename(filename: string) {
  const trimmed = filename.trim() || "artwork";
  const withoutExtension = trimmed.replace(/\.[^.\\/]+$/, "");
  return `${withoutExtension || "artwork"}.webp`;
}
