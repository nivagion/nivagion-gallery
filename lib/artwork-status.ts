import type { ArtworkStatus } from "./types";

export const selectableArtworkStatuses: ArtworkStatus[] = [
  "draft",
  "available",
  "reserved",
  "sold",
  "not_available",
];

export function formatArtworkStatus(status: ArtworkStatus) {
  const labels: Record<ArtworkStatus, string> = {
    draft: "Draft",
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    not_available: "Not available",
    archived: "Archived",
  };
  return labels[status];
}
