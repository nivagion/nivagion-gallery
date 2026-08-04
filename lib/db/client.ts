import { getCloudflareContext } from "@opennextjs/cloudflare";

export type Env = {
  DB?: D1Database;
  ARTWORK_IMAGES?: R2Bucket;
  SITE_URL?: string;
  ADMIN_EMAIL?: string;
  ADMIN_DEV_BYPASS?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
};

export function getEnv(): Env {
  try {
    return getCloudflareContext().env as Env;
  } catch {
    return {
      SITE_URL: process.env.SITE_URL,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_DEV_BYPASS: process.env.ADMIN_DEV_BYPASS,
      TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    };
  }
}

export function getDb() {
  return getEnv().DB ?? null;
}

export function getArtworkBucket() {
  return getEnv().ARTWORK_IMAGES ?? null;
}

export function boolFromDb(value: unknown) {
  return value === true || value === 1 || value === "1";
}

export function id(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

export async function all<T>(statement: D1PreparedStatement) {
  const result = await statement.all<T>();
  return result.results ?? [];
}

export async function first<T>(statement: D1PreparedStatement) {
  return statement.first<T>();
}
