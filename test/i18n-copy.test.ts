import { expect, test } from "vitest";
import { t } from "../lib/i18n-copy";

test("artwork availability labels are localized for public cards", () => {
  expect(t("en").status.available).toBe("available");
  expect(t("en").status.not_available).toBe("not available");
  expect(t("hr").status.available).toBe("dostupno");
  expect(t("hr").status.not_available).toBe("nije dostupno");
});
