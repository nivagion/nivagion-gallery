import type { ArtworkStatus } from "../../lib/types";

export function StatusBadge({ status }: { status: ArtworkStatus }) {
  if (status === "draft" || status === "archived") return null;
  return <span className="status-label">{status}</span>;
}
