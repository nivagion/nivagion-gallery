import { unstable_noStore as noStore } from "next/cache";
import type { ContactMessage } from "../types";
import { all, boolFromDb, getDb, id } from "./client";

type MessageRow = Omit<ContactMessage, "is_starred" | "is_trashed"> & {
  is_starred?: boolean | number | string;
  is_trashed?: boolean | number | string;
};

function normalizeMessage(row: MessageRow): ContactMessage {
  return {
    ...row,
    is_starred: boolFromDb(row.is_starred),
    is_trashed: boolFromDb(row.is_trashed),
  };
}

export async function listMessages(options: { starred?: boolean; trashed?: boolean } = {}) {
  noStore();
  const db = getDb();
  if (!db) return [];
  const clauses = ["COALESCE(is_trashed, 0) = ?"];
  const values: number[] = [options.trashed ? 1 : 0];
  if (options.starred) {
    clauses.push("COALESCE(is_starred, 0) = 1");
  }
  const rows = await all<MessageRow>(
    db
      .prepare(
        `SELECT * FROM contact_messages
         WHERE ${clauses.join(" AND ")}
         ORDER BY COALESCE(is_starred, 0) DESC, created_at DESC
         LIMIT 100`
      )
      .bind(...values)
  );
  return rows.map(normalizeMessage);
}

export async function createContactMessage(input: Omit<ContactMessage, "id" | "created_at" | "reviewed_at" | "is_starred" | "is_trashed">) {
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

export async function updateMessageStar(messageId: string, isStarred: boolean) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db
    .prepare("UPDATE contact_messages SET is_starred = ?, reviewed_at = COALESCE(reviewed_at, ?) WHERE id = ?")
    .bind(isStarred ? 1 : 0, new Date().toISOString(), messageId)
    .run();
}

export async function updateMessageTrash(messageId: string, isTrashed: boolean) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  await db
    .prepare("UPDATE contact_messages SET is_trashed = ?, reviewed_at = COALESCE(reviewed_at, ?) WHERE id = ?")
    .bind(isTrashed ? 1 : 0, new Date().toISOString(), messageId)
    .run();
}
