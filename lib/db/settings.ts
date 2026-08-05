import { unstable_noStore as noStore } from "next/cache";
import { defaultSiteSettings } from "../site";
import type { SiteSettings } from "../types";
import { all, getDb } from "./client";

type SettingRow = {
  key: string;
  value: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  noStore();
  const db = getDb();
  if (!db) return defaultSiteSettings;
  const rows = await all<SettingRow>(db.prepare("SELECT key, value FROM site_settings"));
  const fromDb = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return normalizeSettings({
    ...defaultSiteSettings,
    ...fromDb,
    croatianShippingCents: Number(fromDb.croatianShippingCents ?? defaultSiteSettings.croatianShippingCents),
  });
}

export async function updateSiteSettings(settings: SiteSettings) {
  const db = getDb();
  if (!db) throw new Error("D1 database binding is required.");
  const now = new Date().toISOString();
  const entries = Object.entries(settings);
  await db.batch(
    entries.map(([key, value]) =>
      db
        .prepare(
          "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
        )
        .bind(key, String(value), now)
    )
  );
}

function normalizeSettings(settings: SiteSettings): SiteSettings {
  const next = { ...settings };
  if (
    next.siteDescription.includes("independent art practice") ||
    next.siteDescription.includes("occasional spray-paint work") ||
    next.siteDescription.includes("Atelier Nivagion is") ||
    next.siteDescription.includes("Originals only, no prints") ||
    next.siteDescription.includes("marker drawings and spray-paint")
  ) {
    next.siteDescription = defaultSiteSettings.siteDescription;
  }
  if (
    next.siteDescriptionHr.includes("Originalni radovi") ||
    next.siteDescriptionHr.includes("Radim crteže markerima")
  ) {
    next.siteDescriptionHr = defaultSiteSettings.siteDescriptionHr;
  }
  if (
    next.homepageIntroduction.includes("made by hand") ||
    next.homepageIntroduction.includes("occasional spray-paint")
  ) {
    next.homepageIntroduction = defaultSiteSettings.homepageIntroduction;
  }
  if (
    next.artistBiography.includes("Nivagion is my nickname") ||
    next.artistBiography.includes("amateur artist")
  ) {
    next.artistBiography = defaultSiteSettings.artistBiography;
  }
  return next;
}
