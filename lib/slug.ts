export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function uniqueReference(date = new Date(), random = Math.random()) {
  const stamp = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const suffix = Math.floor(random * 36 ** 4)
    .toString(36)
    .padStart(4, "0")
    .toUpperCase();
  return `NIV-${stamp}-${suffix}`;
}
