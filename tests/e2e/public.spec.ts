import { expect, test } from "@playwright/test";

test("homepage exposes featured art and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Atelier Nivagion" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Works", exact: true })).toBeVisible();
  await expect(page.getByText("DEMO: Marker Study Current")).toBeVisible();
});

test("works page can filter unavailable artwork", async ({ page }) => {
  await page.goto("/works?availability=unavailable");
  await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  await expect(page.getByText("DEMO: Archive Piece")).toBeVisible();
});
