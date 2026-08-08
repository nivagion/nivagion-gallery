import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteArtworkImage,
  getArtworkById,
  insertArtworkImage,
  setPrimaryImage,
  updateImageMetadata,
  updateImageOrder,
} from "../../../../../../lib/db/artworks";
import { id } from "../../../../../../lib/db/client";
import {
  artworkImageObjectKey,
  deleteArtworkObject,
  putArtworkImage,
  validateProcessedArtworkImageFile,
} from "../../../../../../lib/images";
import { assertSameOrigin, requireAdmin } from "../../../../../../lib/security";
import { imageUploadSchema } from "../../../../../../lib/validation/forms";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  await requireAdmin();
  await assertSameOrigin();
  const { id: artworkId } = await params;
  const artwork = await getArtworkById(artworkId);
  if (!artwork) return NextResponse.json({ message: "Artwork not found." }, { status: 404 });

  const formData = await request.formData();
  const parsed = imageUploadSchema.safeParse({
    altText: formData.get("altText"),
    caption: formData.get("caption"),
    isPrimary: formData.has("isPrimary"),
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Check upload fields." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) return NextResponse.json({ message: "Choose at least one image." }, { status: 400 });

  const uploadedObjectKeys: string[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const imageId = id("img");
      const baseKey = artworkImageObjectKey(artworkId, imageId);
      const image = await validateProcessedArtworkImageFile(file);
      await putArtworkImage(baseKey, file);
      uploadedObjectKeys.push(baseKey);
      await insertArtworkImage({
        id: imageId,
        artwork_id: artworkId,
        object_key: baseKey,
        alt_text: parsed.data.altText,
        caption: parsed.data.caption,
        width: image.width,
        height: image.height,
        file_type: image.mime,
        file_size: file.size,
        display_order: artwork.images.length + index,
        is_primary: parsed.data.isPrimary && index === 0,
        created_at: new Date().toISOString(),
      });
      uploadedObjectKeys.splice(uploadedObjectKeys.indexOf(baseKey), 1);
    }
  } catch (error) {
    await Promise.all(uploadedObjectKeys.map((objectKey) => deleteArtworkObject(objectKey)));
    return NextResponse.json({ message: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }

  revalidatePath(`/admin/artworks/${artworkId}`);
  revalidatePath(`/works/${artwork.slug}`);
  return NextResponse.json({ message: "Image uploaded." });
}

export async function DELETE(request: Request) {
  await requireAdmin();
  await assertSameOrigin();
  const { imageId } = (await request.json()) as { imageId?: string };
  if (!imageId) return NextResponse.json({ message: "Image id is required." }, { status: 400 });
  const image = await deleteArtworkImage(imageId);
  if (image) await deleteArtworkObject(image.object_key);
  return NextResponse.json({ message: "Image deleted." });
}

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  await assertSameOrigin();
  const { id: artworkId } = await params;
  const body = (await request.json()) as {
    action?: string;
    imageId?: string;
    ids?: string[];
    altText?: string;
    caption?: string | null;
  };

  if (body.action === "primary" && body.imageId) {
    await setPrimaryImage(artworkId, body.imageId);
  } else if (body.action === "reorder" && Array.isArray(body.ids)) {
    await updateImageOrder(artworkId, body.ids);
  } else if (body.action === "metadata" && body.imageId && body.altText) {
    await updateImageMetadata(body.imageId, body.altText, body.caption ?? null);
  } else {
    return NextResponse.json({ message: "Invalid image update." }, { status: 400 });
  }

  revalidatePath(`/admin/artworks/${artworkId}`);
  return NextResponse.json({ message: "Image updated." });
}
