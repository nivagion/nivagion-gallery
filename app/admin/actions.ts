"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteArtworkById,
  duplicateArtwork,
  getArtworkById,
  updateArtworkOrder,
  updateArtworkPrices,
  updateArtworkStatus,
  updateArtworkStatuses,
  upsertArtwork,
} from "../../lib/db/artworks";
import { updateOrderStatus } from "../../lib/db/orders";
import { updateSiteSettings } from "../../lib/db/settings";
import { updateMessageStar, updateMessageTrash } from "../../lib/db/messages";
import { defaultSiteSettings } from "../../lib/site";
import { id } from "../../lib/db/client";
import { deleteArtworkObject } from "../../lib/images";
import { assertSameOrigin, requireAdmin } from "../../lib/security";
import { slugify } from "../../lib/slug";
import { artworkFormSchema, orderUpdateSchema } from "../../lib/validation/forms";
import type { SiteSettings } from "../../lib/types";
import type { ArtworkStatus } from "../../lib/types";

export async function saveArtwork(_: unknown, formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const formId = formData.get("id") ? String(formData.get("id")) : undefined;
  const artworkId = formId ?? id("art");
  const existingArtwork = formId ? await getArtworkById(formId) : null;
  const title = String(formData.get("title") ?? "").trim() || existingArtwork?.title || "Untitled";
  const status = String(formData.get("status") ?? "draft");
  const slugBase = slugify(title) || "work";
  const slug = existingArtwork?.slug ?? `${slugBase}-${slugify(artworkId).slice(-8)}`;
  const parsed = artworkFormSchema.safeParse({
    id: formId,
    title,
    slug,
    subtitle: null,
    year: formData.get("year"),
    medium: formData.get("medium"),
    surface: formData.get("surface"),
    width_cm: formData.get("width_cm"),
    height_cm: formData.get("height_cm"),
    description: formData.get("description"),
    price_cents: formData.get("price_eur") ?? "",
    currency: formData.get("currency") || "EUR",
    status,
    is_featured: formData.has("is_featured"),
    is_published: status !== "draft",
    revolut_payment_url: formData.get("revolut_payment_url"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check artwork fields." };
  }
  try {
    await upsertArtwork({
      id: artworkId,
      slug: parsed.data.slug,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      year: parsed.data.year,
      medium: parsed.data.medium,
      surface: parsed.data.surface,
      width_cm: parsed.data.width_cm,
      height_cm: parsed.data.height_cm,
      description: parsed.data.description,
      price_cents: parsed.data.price_cents,
      currency: parsed.data.currency,
      status: parsed.data.status,
      is_featured: parsed.data.is_featured,
      is_published: parsed.data.is_published,
      published_at: null,
      reserved_until: null,
      revolut_payment_url: parsed.data.revolut_payment_url,
    });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Artwork could not be saved." };
  }
  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/archive");
  redirect(`/admin/artworks/${artworkId}`);
}

export async function duplicateArtworkAction(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const copyId = await duplicateArtwork(String(formData.get("id")));
  revalidatePath("/admin/artworks");
  redirect(`/admin/artworks/${copyId}`);
}

export async function deleteArtworkAction(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const artworkId = String(formData.get("id") ?? "");
  const images = await deleteArtworkById(artworkId);
  await Promise.all(images.map((image) => deleteArtworkObject(image.object_key)));
  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/admin/artworks");
  revalidatePath("/admin/artworks/order");
  redirect("/admin/artworks");
}

export async function reorderArtworks(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .filter(Boolean);
  await updateArtworkOrder(ids);
  revalidatePath("/admin/artworks");
  revalidatePath("/admin/artworks/order");
  revalidatePath("/works");
}

export async function bulkUpdateArtworkStatus(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const status = String(formData.get("status") ?? "");
  if (!["draft", "available", "reserved", "sold", "not_available", "archived"].includes(status)) {
    throw new Error("Choose a valid status.");
  }
  await updateArtworkStatuses(ids, status as ArtworkStatus);
  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/archive");
  revalidatePath("/admin/artworks");
  revalidatePath("/admin/artworks/order");
}

export async function bulkUpdateArtworkPrice(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const normalized = String(formData.get("price_eur") ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter a valid EUR amount.");
  }
  await updateArtworkPrices(ids, Math.round(Number(normalized) * 100));
  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/archive");
  revalidatePath("/admin/artworks");
}

export async function toggleMessageStar(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  await updateMessageStar(String(formData.get("id") ?? ""), String(formData.get("starred")) !== "true");
  revalidatePath("/admin/messages");
}

export async function moveMessageToTrash(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  await updateMessageTrash(String(formData.get("id") ?? ""), true);
  revalidatePath("/admin/messages");
}

export async function restoreMessageFromTrash(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  await updateMessageTrash(String(formData.get("id") ?? ""), false);
  revalidatePath("/admin/messages");
}

export async function saveOrder(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const parsed = orderUpdateSchema.safeParse({
    paymentStatus: formData.get("paymentStatus"),
    fulfilmentStatus: formData.get("fulfilmentStatus"),
    internalNotes: formData.get("internalNotes"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid order update.");
  await updateOrderStatus({
    orderId: String(formData.get("orderId")),
    paymentStatus: parsed.data.paymentStatus,
    fulfilmentStatus: parsed.data.fulfilmentStatus,
    internalNotes: parsed.data.internalNotes,
  });
  revalidatePath("/admin/orders");
  revalidatePath("/works");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const settings: SiteSettings = {
    ...defaultSiteSettings,
    siteDescription: String(formData.get("siteDescription") ?? defaultSiteSettings.siteDescription),
    siteDescriptionHr: String(formData.get("siteDescriptionHr") ?? defaultSiteSettings.siteDescriptionHr),
    contactEmail: String(formData.get("contactEmail") ?? defaultSiteSettings.contactEmail),
    homepageIntroduction: String(formData.get("homepageIntroduction") ?? defaultSiteSettings.homepageIntroduction),
    homepageIntroductionHr: String(formData.get("homepageIntroductionHr") ?? defaultSiteSettings.homepageIntroductionHr),
    artistBiography: String(formData.get("artistBiography") ?? defaultSiteSettings.artistBiography),
    artistBiographyHr: String(formData.get("artistBiographyHr") ?? defaultSiteSettings.artistBiographyHr),
    studioLocationWording: String(formData.get("studioLocationWording") ?? defaultSiteSettings.studioLocationWording),
    defaultShippingMessage: String(formData.get("defaultShippingMessage") ?? defaultSiteSettings.defaultShippingMessage),
    defaultShippingMessageHr: String(formData.get("defaultShippingMessageHr") ?? defaultSiteSettings.defaultShippingMessageHr),
    croatianShippingCents: Math.max(0, Math.round(Number(String(formData.get("croatianShippingEur") ?? "0").replace(",", ".")) * 100)),
    internationalShippingMode: String(formData.get("internationalShippingMode") ?? defaultSiteSettings.internationalShippingMode),
    announcementText: String(formData.get("announcementText") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    otherSocialUrl: String(formData.get("otherSocialUrl") ?? ""),
    returnConditions: String(formData.get("returnConditions") ?? defaultSiteSettings.returnConditions),
    commissionAvailability: String(formData.get("commissionAvailability") ?? defaultSiteSettings.commissionAvailability),
    commissionAvailabilityHr: String(formData.get("commissionAvailabilityHr") ?? defaultSiteSettings.commissionAvailabilityHr),
    customDomainEmail: String(formData.get("customDomainEmail") ?? defaultSiteSettings.customDomainEmail),
    legalSellerInformation: String(formData.get("legalSellerInformation") ?? defaultSiteSettings.legalSellerInformation),
    croatianBusinessTaxInformation: String(formData.get("croatianBusinessTaxInformation") ?? defaultSiteSettings.croatianBusinessTaxInformation),
  };
  await updateSiteSettings(settings);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/shipping-and-returns");
}

export async function setSoldFromOrder(formData: FormData) {
  await requireAdmin();
  await assertSameOrigin();
  const artwork = await getArtworkById(String(formData.get("artworkId")));
  if (!artwork) throw new Error("Artwork not found.");
  await updateArtworkStatus(artwork.id, "sold");
  revalidatePath("/admin/orders");
  revalidatePath("/works");
}
