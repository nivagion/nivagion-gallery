import { unstable_noStore as noStore } from "next/cache";
import type { Artwork, ArtworkImage, ArtworkStatus, ArtworkWithImages } from "../types";
import { boolFromDb, getDb, all, first, id } from "./client";
import { demoArtworks } from "./seed-data";

type Sort = "manual" | "newest" | "price-asc" | "price-desc";
type Availability = "all" | "available" | "sold";

function normalizeArtwork(row: Artwork): Artwork {
  return {
    ...row,
    is_featured: boolFromDb(row.is_featured),
    is_published: boolFromDb(row.is_published),
  };
}

function normalizeImage(row: ArtworkImage): ArtworkImage {
  return {
    ...row,
    is_primary: boolFromDb(row.is_primary),
  };
}

function orderClause(sort: Sort) {
  if (sort === "newest") return "published_at DESC, created_at DESC";
  if (sort === "price-asc") return "price_cents IS NULL, price_cents ASC, manual_sort_order ASC";
  if (sort === "price-desc") return "price_cents DESC, manual_sort_order ASC";
  return "manual_sort_order ASC, published_at DESC";
}

function applyReservationExpiry(artwork: Artwork): Artwork {
  if (
    artwork.status === "reserved" &&
    artwork.reserved_until &&
    new Date(artwork.reserved_until).getTime() < Date.now()
  ) {
    return { ...artwork, status: "available", reserved_until: null };
  }
  return artwork;
}

function filterDemo(sort: Sort, availability: Availability, includeDrafts = false) {
  const filtered = demoArtworks
    .map((artwork) => ({ ...artwork, status: applyReservationExpiry(artwork).status }))
    .filter((artwork) => includeDrafts || (artwork.is_published && artwork.status !== "draft"))
    .filter((artwork) => {
      if (availability === "available") return artwork.status === "available";
      if (availability === "sold") return artwork.status === "sold";
      return artwork.status !== "archived";
    });

  return filtered.sort((a, b) => {
    if (sort === "newest") return b.created_at.localeCompare(a.created_at);
    if (sort === "price-asc") return (a.price_cents ?? Number.MAX_SAFE_INTEGER) - (b.price_cents ?? Number.MAX_SAFE_INTEGER);
    if (sort === "price-desc") return (b.price_cents ?? 0) - (a.price_cents ?? 0);
    return a.manual_sort_order - b.manual_sort_order;
  });
}

export async function listPublicArtworks(options: { sort?: Sort; availability?: Availability } = {}) {
  noStore();
  const sort = options.sort ?? "manual";
  const availability = options.availability ?? "all";
  const db = getDb();
  if (!db) return filterDemo(sort, availability);

  await releaseExpiredReservations();
  const clauses = ["a.is_published = 1", "a.status != 'draft'"];
  if (availability === "available") clauses.push("a.status = 'available'");
  if (availability === "sold") clauses.push("a.status = 'sold'");
  if (availability === "all") clauses.push("a.status != 'archived'");

  const rows = await all<Artwork & ArtworkImage>(
    db
      .prepare(
        `SELECT a.*, i.id as image_id
         FROM artworks a
         LEFT JOIN artwork_images i ON i.artwork_id = a.id AND i.is_primary = 1
         WHERE ${clauses.join(" AND ")}
         ORDER BY ${orderClause(sort)}`
      )
  );

  const artworks = await Promise.all(rows.map((row) => getArtworkById(row.id)));
  return artworks.filter(Boolean) as ArtworkWithImages[];
}

export async function listFeaturedArtworks() {
  noStore();
  const db = getDb();
  if (!db) return demoArtworks.filter((artwork) => artwork.is_featured && artwork.is_published);
  await releaseExpiredReservations();
  const rows = await all<Artwork>(
    db
      .prepare(
        "SELECT * FROM artworks WHERE is_featured = 1 AND is_published = 1 AND status != 'archived' ORDER BY manual_sort_order ASC LIMIT 6"
      )
  );
  const artworks = await Promise.all(rows.map((row) => getArtworkById(row.id)));
  return artworks.filter(Boolean) as ArtworkWithImages[];
}

export async function getArtworkBySlug(slug: string) {
  noStore();
  const db = getDb();
  if (!db) return demoArtworks.find((artwork) => artwork.slug === slug && artwork.is_published) ?? null;
  await releaseExpiredReservations();
  const artwork = await first<Artwork>(
    db.prepare("SELECT * FROM artworks WHERE slug = ? AND is_published = 1").bind(slug)
  );
  if (!artwork) return null;
  return withImages(normalizeArtwork(artwork));
}

export async function getArtworkById(artworkId: string) {
  noStore();
  const db = getDb();
  if (!db) return demoArtworks.find((artwork) => artwork.id === artworkId) ?? null;
  const artwork = await first<Artwork>(db.prepare("SELECT * FROM artworks WHERE id = ?").bind(artworkId));
  if (!artwork) return null;
  return withImages(normalizeArtwork(artwork));
}

export async function listAdminArtworks() {
  noStore();
  const db = getDb();
  if (!db) return demoArtworks;
  await releaseExpiredReservations();
  const rows = await all<Artwork>(
    db.prepare("SELECT * FROM artworks ORDER BY manual_sort_order ASC, updated_at DESC")
  );
  const artworks = await Promise.all(rows.map((row) => withImages(normalizeArtwork(row))));
  return artworks;
}

export async function getAdjacentArtworks(artwork: Artwork) {
  const items = await listPublicArtworks({ sort: "manual" });
  const index = items.findIndex((item) => item.id === artwork.id);
  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index >= 0 && index < items.length - 1 ? items[index + 1] : null,
    related: items.filter((item) => item.id !== artwork.id && item.medium === artwork.medium).slice(0, 3),
  };
}

async function withImages(artwork: Artwork): Promise<ArtworkWithImages> {
  const db = getDb();
  if (!db) {
    const demo = demoArtworks.find((item) => item.id === artwork.id);
    return demo ?? { ...artwork, images: [] };
  }
  const images = await all<ArtworkImage>(
    db
      .prepare("SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY display_order ASC, created_at ASC")
      .bind(artwork.id)
  );
  return { ...applyReservationExpiry(artwork), images: images.map(normalizeImage) };
}

export async function upsertArtwork(input: Omit<Artwork, "created_at" | "updated_at" | "manual_sort_order"> & { manual_sort_order?: number }) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required to save artwork.");
  const existing = await first<Artwork>(db.prepare("SELECT * FROM artworks WHERE id = ?").bind(input.id));
  const now = new Date().toISOString();
  if (existing) {
    await db
      .prepare(
        `UPDATE artworks SET slug = ?, title = ?, subtitle = ?, year = ?, medium = ?, surface = ?,
         width_cm = ?, height_cm = ?, description = ?, price_cents = ?, currency = ?, status = ?,
         is_featured = ?, is_published = ?, updated_at = ?, published_at = CASE WHEN ? = 1 AND published_at IS NULL THEN ? ELSE published_at END,
         reserved_until = ?, revolut_payment_url = ? WHERE id = ?`
      )
      .bind(
        input.slug,
        input.title,
        input.subtitle,
        input.year,
        input.medium,
        input.surface,
        input.width_cm,
        input.height_cm,
        input.description,
        input.price_cents,
        input.currency,
        input.status,
        input.is_featured ? 1 : 0,
        input.is_published ? 1 : 0,
        now,
        input.is_published ? 1 : 0,
        now,
        input.reserved_until,
        input.revolut_payment_url,
        input.id
      )
      .run();
    return input.id;
  }

  const sort = input.manual_sort_order ?? Date.now();
  await db
    .prepare(
      `INSERT INTO artworks
       (id, slug, title, subtitle, year, medium, surface, width_cm, height_cm, description,
        price_cents, currency, status, is_featured, is_published, manual_sort_order,
        created_at, updated_at, published_at, reserved_until, revolut_payment_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.id,
      input.slug,
      input.title,
      input.subtitle,
      input.year,
      input.medium,
      input.surface,
      input.width_cm,
      input.height_cm,
      input.description,
      input.price_cents,
      input.currency,
      input.status,
      input.is_featured ? 1 : 0,
      input.is_published ? 1 : 0,
      sort,
      now,
      now,
      input.is_published ? now : null,
      input.reserved_until,
      input.revolut_payment_url
    )
    .run();
  return input.id;
}

export async function duplicateArtwork(artworkId: string) {
  const source = await getArtworkById(artworkId);
  if (!source) throw new Error("Artwork not found.");
  const copyId = id("art");
  await upsertArtwork({
    ...source,
    id: copyId,
    slug: `${source.slug}-copy`,
    title: `${source.title} copy`,
    status: "draft",
    is_published: false,
    is_featured: false,
    published_at: null,
    reserved_until: null,
  });
  return copyId;
}

export async function updateArtworkStatus(artworkId: string, status: ArtworkStatus) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db
    .prepare("UPDATE artworks SET status = ?, updated_at = ?, reserved_until = CASE WHEN ? != 'reserved' THEN NULL ELSE reserved_until END WHERE id = ?")
    .bind(status, new Date().toISOString(), status, artworkId)
    .run();
}

export async function updateArtworkOrder(ids: string[]) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  const statements = ids.map((artworkId, index) =>
    db.prepare("UPDATE artworks SET manual_sort_order = ?, updated_at = ? WHERE id = ?").bind(index * 10, new Date().toISOString(), artworkId)
  );
  await db.batch(statements);
}

export async function insertArtworkImage(image: ArtworkImage) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  if (image.is_primary) {
    await db.prepare("UPDATE artwork_images SET is_primary = 0 WHERE artwork_id = ?").bind(image.artwork_id).run();
  }
  await db
    .prepare(
      `INSERT INTO artwork_images
       (id, artwork_id, object_key, alt_text, caption, width, height, file_type, file_size, display_order, is_primary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      image.id,
      image.artwork_id,
      image.object_key,
      image.alt_text,
      image.caption,
      image.width,
      image.height,
      image.file_type,
      image.file_size,
      image.display_order,
      image.is_primary ? 1 : 0,
      image.created_at
    )
    .run();
}

export async function deleteArtworkImage(imageId: string) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  const image = await first<ArtworkImage>(db.prepare("SELECT * FROM artwork_images WHERE id = ?").bind(imageId));
  if (!image) return null;
  await db.prepare("DELETE FROM artwork_images WHERE id = ?").bind(imageId).run();
  return image;
}

export async function updateImageMetadata(imageId: string, altText: string, caption: string | null) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db
    .prepare("UPDATE artwork_images SET alt_text = ?, caption = ? WHERE id = ?")
    .bind(altText, caption, imageId)
    .run();
}

export async function setPrimaryImage(artworkId: string, imageId: string) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db.batch([
    db.prepare("UPDATE artwork_images SET is_primary = 0 WHERE artwork_id = ?").bind(artworkId),
    db.prepare("UPDATE artwork_images SET is_primary = 1 WHERE id = ? AND artwork_id = ?").bind(imageId, artworkId),
  ]);
}

export async function updateImageOrder(artworkId: string, imageIds: string[]) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db.batch(
    imageIds.map((imageId, index) =>
      db
        .prepare("UPDATE artwork_images SET display_order = ? WHERE id = ? AND artwork_id = ?")
        .bind(index, imageId, artworkId)
    )
  );
}

export async function releaseExpiredReservations() {
  const db = getDb();
  if (!db) return;
  await db
    .prepare(
      "UPDATE artworks SET status = 'available', reserved_until = NULL, updated_at = ? WHERE status = 'reserved' AND reserved_until IS NOT NULL AND reserved_until < ?"
    )
    .bind(new Date().toISOString(), new Date().toISOString())
    .run();
}
