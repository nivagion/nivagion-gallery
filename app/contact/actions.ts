"use server";

import { redirect } from "next/navigation";
import { createContactMessage } from "../../lib/db/messages";
import { assertSameOrigin, checkBasicRateLimit, visitorKey } from "../../lib/security";
import { contactSchema } from "../../lib/validation/forms";

export async function submitContactForm(_: unknown, formData: FormData) {
  await assertSameOrigin();
  const key = await visitorKey();
  if (!checkBasicRateLimit(`contact:${key}`)) {
    return { ok: false, message: "Too many messages. Please try again later." };
  }
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    artworkReference: formData.get("artworkReference"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form fields." };
  }
  try {
    await createContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      artwork_reference: parsed.data.artworkReference,
      ip_hash: key,
    });
  } catch {
    return {
      ok: false,
      message: "Messages require the D1 database locally. Run through Wrangler after migrations, or email the studio directly.",
    };
  }
  redirect("/contact?sent=1");
}
