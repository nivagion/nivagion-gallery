import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { insertArtworkImage, deleteArtworkById, upsertArtwork } from "../../../../../lib/db/artworks";
import { id } from "../../../../../lib/db/client";
import {
  artworkImageObjectKey,
  deleteArtworkObject,
  putArtworkImage,
  validateProcessedArtworkImageFile,
} from "../../../../../lib/images";
import { assertSameOrigin, requireAdmin } from "../../../../../lib/security";
import { slugify } from "../../../../../lib/slug";
import { unnamedArtworkTitle } from "../../../../../lib/batch-artworks";
import { batchArtworkDefaultsSchema } from "../../../../../lib/validation/forms";

export async function POST(request: Request) {
  await requireAdmin();
  await assertSameOrigin();

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) {
    return NextResponse.json({ message: "Choose at least one image." }, { status: 400 });
  }

  const parsed = batchArtworkDefaultsSchema.safeParse({
    year: formString(formData, "year"),
    medium: formString(formData, "medium"),
    surface: formString(formData, "surface"),
    width_cm: formString(formData, "width_cm"),
    height_cm: formString(formData, "height_cm"),
    description: formString(formData, "description"),
    price_cents: formString(formData, "price_eur"),
    currency: formString(formData, "currency") || "EUR",
    status: formData.get("status") ?? "draft",
    is_published: formData.has("is_published"),
    revolut_payment_url: formString(formData, "revolut_payment_url"),
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check artwork fields." }, { status: 400 });
  }

  const altTexts = formData.getAll("altTexts").map((value) => String(value).trim());
  const uploadedObjectKeys: string[] = [];
  const createdArtworkIds: string[] = [];

  try {
    const validatedFiles = await Promise.all(
      files.map(async (file) => ({
        file,
        metadata: await validateProcessedArtworkImageFile(file),
      }))
    );

    for (const [index, item] of validatedFiles.entries()) {
      const artworkId = id("art");
      const imageId = id("img");
      const objectKey = artworkImageObjectKey(artworkId, imageId);
      const slug = `${slugify(unnamedArtworkTitle) || "work"}-${slugify(artworkId).slice(-8)}`;
      const now = new Date().toISOString();

      await putArtworkImage(objectKey, item.file);
      uploadedObjectKeys.push(objectKey);

      await upsertArtwork({
        id: artworkId,
        slug,
        title: unnamedArtworkTitle,
        subtitle: null,
        year: parsed.data.year,
        medium: parsed.data.medium,
        surface: parsed.data.surface,
        width_cm: parsed.data.width_cm,
        height_cm: parsed.data.height_cm,
        description: parsed.data.description,
        price_cents: parsed.data.price_cents,
        currency: parsed.data.currency,
        status: parsed.data.status,
        is_featured: false,
        is_published: parsed.data.status !== "draft" && parsed.data.is_published,
        published_at: null,
        reserved_until: null,
        revolut_payment_url: parsed.data.revolut_payment_url,
      });
      createdArtworkIds.push(artworkId);

      await insertArtworkImage({
        id: imageId,
        artwork_id: artworkId,
        object_key: objectKey,
        alt_text: altTexts[index] || `Artwork image ${index + 1}`,
        caption: null,
        width: item.metadata.width,
        height: item.metadata.height,
        file_type: item.metadata.mime,
        file_size: item.file.size,
        display_order: 0,
        is_primary: true,
        created_at: now,
      });
    }
  } catch (error) {
    const imageRows = await Promise.all(createdArtworkIds.map((artworkId) => deleteArtworkById(artworkId)));
    const rowObjectKeys = imageRows.flat().map((image) => image.object_key);
    await Promise.all([...new Set([...uploadedObjectKeys, ...rowObjectKeys])].map((objectKey) => deleteArtworkObject(objectKey)));
    return NextResponse.json({ message: error instanceof Error ? error.message : "Batch upload failed." }, { status: 400 });
  }

  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/archive");
  revalidatePath("/admin/artworks");
  revalidatePath("/admin/artworks/order");
  return NextResponse.json({ message: `Created ${files.length} artworks.`, count: files.length });
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}
