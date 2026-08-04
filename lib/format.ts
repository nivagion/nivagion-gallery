export function formatMoney(cents: number | null | undefined, currency = "EUR") {
  if (cents == null) return "Price on request";
  return new Intl.NumberFormat("en-HR", {
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
