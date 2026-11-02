import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { siteConfig } from "./site";
import { getEnv } from "./db/client";
import { createRemoteJWKSet, jwtVerify } from "jose";

const formHits = new Map<string, number[]>();
const accessKeys = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function requireAdmin() {
  const headerList = await headers();
  const env = getEnv();
  const expectedEmail = env.ADMIN_EMAIL ?? siteConfig.currentContactEmail;
  const accessEmail = headerList.get("cf-access-authenticated-user-email");
  const devBypass =
    process.env.NODE_ENV !== "production" &&
    (env.ADMIN_DEV_BYPASS === "true" || process.env.ADMIN_DEV_BYPASS === "true");

  if (devBypass) return { email: expectedEmail, mode: "development" as const };
  const token = headerList.get("cf-access-jwt-assertion");
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN;
  const audience = env.CF_ACCESS_AUD;
  if (!token || !teamDomain || !audience || !accessEmail) notFound();
  let verifiedEmail: string | undefined;
  try {
    const issuer = `https://${teamDomain}`;
    let jwks = accessKeys.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      accessKeys.set(issuer, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      algorithms: ["RS256"],
    });
    verifiedEmail = typeof payload.email === "string" ? payload.email : undefined;
  } catch {
    notFound();
  }
  if (!verifiedEmail || verifiedEmail.toLowerCase() !== expectedEmail.toLowerCase() ||
      accessEmail.toLowerCase() !== verifiedEmail.toLowerCase()) notFound();
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
