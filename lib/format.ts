import type { Locale } from "./i18n-copy";

export function formatMoney(cents: number | null | undefined, currency = "EUR", locale: Locale = "en") {
  if (cents == null) return locale === "hr" ? "Cijena na upit" : "Price on request";
  return new Intl.NumberFormat(locale === "hr" ? "hr-HR" : "en-HR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDimensions(width: number | null, height: number | null) {
  if (!width || !height) return "Dimensions to be confirmed";
  return `${width} x ${height} cm`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-HR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(new Date(value));
}
