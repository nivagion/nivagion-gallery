import { unstable_noStore as noStore } from "next/cache";
import type { ContactMessage } from "../types";
import { all, getDb, id } from "./client";

export async function listMessages() {
  noStore();
  const db = getDb();
  if (!db) return [];
  return all<ContactMessage>(
    db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100")
  );
}

export async function createContactMessage(input: Omit<ContactMessage, "id" | "created_at" | "reviewed_at">) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required to store messages.");
  await db
    .prepare(
      `INSERT INTO contact_messages
       (id, name, email, subject, message, artwork_reference, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id("msg"),
      input.name,
      input.email,
      input.subject,
      input.message,
      input.artwork_reference,
      input.ip_hash,
      new Date().toISOString()
    )
    .run();
}
