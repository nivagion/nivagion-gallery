"use server";

import { redirect } from "next/navigation";
import { getArtworkBySlug } from "../../../lib/db/artworks";
import { createOrder } from "../../../lib/db/orders";
import { getSiteSettings } from "../../../lib/db/settings";
import { revolutLinkProvider } from "../../../lib/payments/provider";
import { assertSameOrigin, checkBasicRateLimit, visitorKey } from "../../../lib/security";
import { checkoutSchema } from "../../../lib/validation/forms";

export async function submitCheckout(slug: string, _: unknown, formData: FormData) {
  await assertSameOrigin();
  const key = await visitorKey();
  if (!checkBasicRateLimit(`checkout:${key}`, 3)) {
    return { ok: false, message: "Too many purchase attempts. Please try again later." };
  }
  const artwork = await getArtworkBySlug(slug);
  if (!artwork || artwork.status !== "available") {
    return { ok: false, message: "This artwork is not currently available." };
  }
  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    streetAddress: formData.get("streetAddress"),
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    country: formData.get("country"),
    deliveryNote: formData.get("deliveryNote"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form fields." };
  }
  if (artwork.price_cents == null) {
    return { ok: false, message: "This artwork needs a confirmed price before checkout." };
  }

  const settings = await getSiteSettings();
  const providerIntent = revolutLinkProvider.createIntent(artwork);
  let reference: string;
  try {
    reference = await createOrder({
      artworkId: artwork.id,
      customerFullName: parsed.data.fullName,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      streetAddress: parsed.data.streetAddress,
      postalCode: parsed.data.postalCode,
      city: parsed.data.city,
      country: parsed.data.country,
      deliveryNote: parsed.data.deliveryNote,
      artworkPriceCents: artwork.price_cents,
      shippingPriceCents: settings.croatianShippingCents,
      currency: artwork.currency,
      paymentMethod: providerIntent.mode === "redirect" ? "revolut-link" : "manual-request",
      revolutPaymentUrlUsed: providerIntent.redirectUrl,
    });
  } catch {
    return {
      ok: false,
      message: "Orders require the D1 database locally. Run through Wrangler after migrations, or contact me directly.",
    };
  }

  if (providerIntent.redirectUrl) {
    redirect(`/order/${reference}?payment=redirect`);
  }
  redirect(`/order/${reference}`);
}
