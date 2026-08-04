import { unstable_noStore as noStore } from "next/cache";
import type { FulfilmentStatus, Order, PaymentStatus } from "../types";
import { all, first, getDb, id } from "./client";
import { uniqueReference } from "../slug";
import { demoOrders } from "./seed-data";

export async function listOrders(query = "") {
  noStore();
  const db = getDb();
  if (!db) return demoOrders;
  const search = `%${query.trim()}%`;
  return all<Order>(
    db
      .prepare(
        `SELECT o.*, a.title as artwork_title, a.slug as artwork_slug
         FROM orders o
         JOIN artworks a ON a.id = o.artwork_id
         WHERE ? = '%%' OR o.public_reference LIKE ? OR o.customer_full_name LIKE ? OR o.email LIKE ? OR a.title LIKE ?
         ORDER BY o.created_at DESC`
      )
      .bind(search, search, search, search, search)
  );
}

export async function getOrderByReference(reference: string) {
  noStore();
  const db = getDb();
  if (!db) return demoOrders.find((order) => order.public_reference === reference) ?? null;
  return first<Order>(
    db
      .prepare(
        `SELECT o.*, a.title as artwork_title, a.slug as artwork_slug
         FROM orders o
         JOIN artworks a ON a.id = o.artwork_id
         WHERE o.public_reference = ?`
      )
      .bind(reference)
  );
}

export async function createOrder(input: {
  artworkId: string;
  customerFullName: string;
  email: string;
  telephone: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  deliveryNote: string | null;
  artworkPriceCents: number;
  shippingPriceCents: number;
  currency: string;
  paymentMethod: string;
  revolutPaymentUrlUsed: string | null;
}) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required to create orders.");
  const now = new Date().toISOString();
  const reference = uniqueReference();
  const total = input.artworkPriceCents + input.shippingPriceCents;
  await db
    .prepare(
      `INSERT INTO orders
       (id, public_reference, artwork_id, customer_full_name, email, telephone, street_address, postal_code, city, country,
        delivery_note, artwork_price_cents, shipping_price_cents, total_price_cents, currency, payment_method,
        payment_status, fulfilment_status, revolut_payment_url_used, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id("ord"),
      reference,
      input.artworkId,
      input.customerFullName,
      input.email,
      input.telephone,
      input.streetAddress,
      input.postalCode,
      input.city,
      input.country,
      input.deliveryNote,
      input.artworkPriceCents,
      input.shippingPriceCents,
      total,
      input.currency,
      input.paymentMethod,
      input.revolutPaymentUrlUsed ? "pending" : "request",
      "unfulfilled",
      input.revolutPaymentUrlUsed,
      now,
      now
    )
    .run();

  const reservedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await db
    .prepare(
      "UPDATE artworks SET status = 'reserved', reserved_until = ?, updated_at = ? WHERE id = ? AND status = 'available'"
    )
    .bind(reservedUntil, now, input.artworkId)
    .run();
  return reference;
}

export async function updateOrderStatus(input: {
  orderId: string;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  internalNotes: string | null;
}) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  const now = new Date().toISOString();
  const order = await first<Order>(db.prepare("SELECT * FROM orders WHERE id = ?").bind(input.orderId));
  if (!order) throw new Error("Order not found.");

  await db
    .prepare(
      `UPDATE orders SET payment_status = ?, fulfilment_status = ?, internal_notes = ?, updated_at = ?,
       paid_at = CASE WHEN ? = 'paid' AND paid_at IS NULL THEN ? ELSE paid_at END,
       shipped_at = CASE WHEN ? = 'shipped' AND shipped_at IS NULL THEN ? ELSE shipped_at END
       WHERE id = ?`
    )
    .bind(
      input.paymentStatus,
      input.fulfilmentStatus,
      input.internalNotes,
      now,
      input.paymentStatus,
      now,
      input.fulfilmentStatus,
      now,
      input.orderId
    )
    .run();

  if (input.paymentStatus === "paid") {
    await db
      .prepare("UPDATE artworks SET status = 'sold', reserved_until = NULL, updated_at = ? WHERE id = ?")
      .bind(now, order.artwork_id)
      .run();
  }
}
