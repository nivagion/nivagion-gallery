import { z } from "zod";
import type { ArtworkStatus, FulfilmentStatus, PaymentStatus } from "../types";

export const artworkStatuses: ArtworkStatus[] = [
  "draft",
  "available",
  "reserved",
  "sold",
  "archived",
];

export const paymentStatuses: PaymentStatus[] = [
  "request",
  "pending",
  "paid",
  "cancelled",
  "refunded",
];

export const fulfilmentStatuses: FulfilmentStatus[] = [
  "unfulfilled",
  "shipped",
  "cancelled",
  "refunded",
];

const optionalText = z.preprocess(
  (value) => (value == null ? "" : value),
  z.string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
);

const centsFromEuro = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value.length === 0) return null;
    const normalized = value.replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid EUR amount." });
      return z.NEVER;
    }
    return Math.round(Number(normalized) * 100);
  });

export const artworkFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Title is required.").max(160),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  subtitle: optionalText,
  year: z
    .string()
    .trim()
    .transform((value) => (value.length ? Number(value) : null))
    .pipe(z.number().int().min(1900).max(2100).nullable()),
  medium: z.string().trim().min(1, "Medium is required.").max(120),
  surface: optionalText,
  width_cm: z
    .string()
    .trim()
    .transform((value) => (value.length ? Number(value.replace(",", ".")) : null))
    .pipe(z.number().positive().max(10000).nullable()),
  height_cm: z
    .string()
    .trim()
    .transform((value) => (value.length ? Number(value.replace(",", ".")) : null))
    .pipe(z.number().positive().max(10000).nullable()),
  description: optionalText,
  price_cents: centsFromEuro,
  currency: z.string().trim().default("EUR"),
  status: z.enum(["draft", "available", "reserved", "sold", "archived"]),
  is_featured: z.coerce.boolean().default(false),
  is_published: z.coerce.boolean().default(false),
  revolut_payment_url: z
    .string()
    .trim()
    .url("Enter a full payment URL.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(160),
  email: z.string().trim().email("Enter a valid email address.").max(220),
  telephone: z.string().trim().min(5, "Enter a phone number.").max(80),
  streetAddress: z.string().trim().min(4, "Enter your street address.").max(220),
  postalCode: z.string().trim().min(2, "Enter your postal code.").max(40),
  city: z.string().trim().min(2, "Enter your city.").max(120),
  country: z.string().trim().min(2, "Enter your country.").max(120),
  deliveryNote: z.string().trim().max(1000).optional().transform((value) => value || null),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(220),
  subject: z.string().trim().min(2, "Enter a subject.").max(160),
  message: z.string().trim().min(10, "Write a short message.").max(5000),
  artworkReference: z.string().trim().max(160).optional().transform((value) => value || null),
});

export const imageUploadSchema = z.object({
  altText: z.string().trim().min(3, "Alt text is required.").max(220),
  caption: z.string().trim().max(300).optional().transform((value) => value || null),
  isPrimary: z.coerce.boolean().default(false),
});

export const orderUpdateSchema = z.object({
  paymentStatus: z.enum(["request", "pending", "paid", "cancelled", "refunded"]),
  fulfilmentStatus: z.enum(["unfulfilled", "shipped", "cancelled", "refunded"]),
  internalNotes: z.string().trim().max(5000).optional().transform((value) => value || null),
});
