import type { MetadataRoute } from "next";
import { listPublicArtworks } from "../lib/db/artworks";
import { canonical } from "../lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await listPublicArtworks({ sort: "newest" });
  const staticRoutes = [
    "/",
    "/works",
    "/archive",
    "/about",
    "/contact",
    "/shipping-and-returns",
    "/privacy",
    "/terms",
  ];
  return [
    ...staticRoutes.map((route) => ({
      url: canonical(route),
      lastModified: new Date(),
    })),
    ...artworks.map((artwork) => ({
      url: canonical(`/works/${artwork.slug}`),
      lastModified: new Date(artwork.updated_at),
    })),
  ];
}
