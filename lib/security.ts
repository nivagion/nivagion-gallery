import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { siteConfig } from "./site";
import { getEnv } from "./db/client";

const formHits = new Map<string, number[]>();

export async function requireAdmin() {
  const headerList = await headers();
  const env = getEnv();
  const expectedEmail = env.ADMIN_EMAIL ?? siteConfig.currentContactEmail;
  const accessEmail = headerList.get("cf-access-authenticated-user-email");
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    (env.ADMIN_DEV_BYPASS === "true" || process.env.ADMIN_DEV_BYPASS === "true");

  if (devBypass) return { email: expectedEmail, mode: "development" as const };
  if (!accessEmail) notFound();
  if (accessEmail.toLowerCase() !== expectedEmail.toLowerCase()) notFound();
  return { email: accessEmail, mode: "cloudflare-access" as const };
}

export async function assertSameOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");
  if (!origin || !host) return;
  const originHost = new URL(origin).host;
  if (originHost !== host) throw new Error("Invalid form origin.");
}

export async function visitorKey() {
  const headerList = await headers();
  const raw =
    headerList.get("cf-connecting-ip") ??
    headerList.get("x-forwarded-for") ??
    "local";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function checkBasicRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (formHits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  formHits.set(key, recent);
  return true;
}

export function safeText(value: string | null | undefined) {
  return value?.replace(/[<>]/g, "") ?? "";
}
