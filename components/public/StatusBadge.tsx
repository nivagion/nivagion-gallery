import type { ArtworkStatus } from "../../lib/types";
import type { Locale } from "../../lib/i18n-copy";
import { t } from "../../lib/i18n-copy";

export function StatusBadge({ status, locale = "en" }: { status: ArtworkStatus; locale?: Locale }) {
  if (status === "draft" || status === "archived") return null;
  return <span className="status-label">{t(locale).status[status]}</span>;
}
