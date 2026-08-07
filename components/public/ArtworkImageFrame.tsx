import { clsx } from "clsx";
import { artworkImageUrl } from "../../lib/images";
import type { ArtworkImage } from "../../lib/types";

type ArtworkImageFrameProps = {
  image: ArtworkImage;
  alt?: string;
  className?: string;
  foregroundClassName?: string;
};

export function ArtworkImageFrame({
  image,
  alt = "",
  className,
  foregroundClassName,
}: ArtworkImageFrameProps) {
  const src = artworkImageUrl(image);
  const aspectRatio = frameAspectRatio(image);

  return (
    <div
      className={clsx("relative overflow-hidden border border-[#084A24]/15 bg-[#F2EDD5]", className)}
      style={{ aspectRatio }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(242,103,22,0.16),transparent_36%),radial-gradient(circle_at_80%_75%,rgba(8,74,36,0.18),transparent_40%)]"
        aria-hidden
      />
      <img
        src={src}
        alt={alt}
        width={image.width ?? 900}
        height={image.height ?? 1200}
        loading="lazy"
        className={clsx(
          "relative z-10 h-full w-full object-contain p-3 transition duration-300",
          foregroundClassName
        )}
      />
    </div>
  );
}

export function artworkOrientation(image?: Pick<ArtworkImage, "width" | "height">) {
  if (!image?.width || !image.height) return "portrait";
  const ratio = image.width / image.height;
  if (ratio > 1.12) return "landscape";
  if (ratio < 0.9) return "portrait";
  return "square";
}

function frameAspectRatio(image: Pick<ArtworkImage, "width" | "height">) {
  if (image.width && image.height) return `${image.width} / ${image.height}`;
  const orientation = artworkOrientation(image);
  if (orientation === "landscape") return "16 / 10";
  if (orientation === "square") return "1 / 1";
  return "4 / 5";
}
