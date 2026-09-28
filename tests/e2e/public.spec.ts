import { expect, test } from "@playwright/test";

test("homepage defaults to Croatian and exposes featured art", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "hr");
  await expect(page.getByRole("heading", { name: "Atelier Nivagion" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Atelier Nivagion" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Radovi", exact: true })).toBeVisible();
  await expect(page.getByText("DEMO: Marker Study Current")).toBeVisible();
  await expect(page.getByRole("link", { name: "Još radova" })).toHaveAttribute("href", "/works");
  await expect(page.getByText(/cijena|prodano|prodaja/i)).toHaveCount(0);
});

test("works page presents artworks without sales language", async ({ page }) => {
  await page.goto("/works");
  await expect(page.getByRole("heading", { name: "Radovi" })).toBeVisible();
  await expect(page.getByText("DEMO: Archive Piece")).toBeVisible();
  await expect(page.getByText(/cijena|prodano|prodaja/i)).toHaveCount(0);
});

test("English artwork inquiry opens the contact form without sales details", async ({ page }) => {
  await page.goto("/api/locale?locale=en&next=/works/demo-marker-study-current");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText(/price|sold|purchase|shipping/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Ask about this work" }).click();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  await expect(page.getByLabel("Artwork reference")).toHaveValue("DEMO: Marker Study Current");
});

test("about page keeps only the short Croatian introduction", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "O meni" })).toBeVisible();
  await expect(page.getByText("Izrađujem razne crteže markerima i spray-paint radove.")).toBeVisible();
  await expect(page.getByText("Za ideje po dogovoru, pošalji mi poruku.")).toBeVisible();
  await expect(page.getByText(/Ja sam Leo|Croatia|Hrvatska/)).toHaveCount(0);
});
