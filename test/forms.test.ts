import { describe, expect, it } from "vitest";
import { artworkFormSchema, checkoutSchema } from "../lib/validation/forms";

describe("form validation", () => {
  it("stores artwork prices as integer cents", () => {
    const parsed = artworkFormSchema.parse({
      title: "Test",
      slug: "test",
      year: "2026",
      medium: "Marker",
      width_cm: "20",
      height_cm: "30",
      price_cents: "123,45",
      currency: "EUR",
      status: "available",
      is_featured: false,
      is_published: true,
    });
    expect(parsed.price_cents).toBe(12345);
  });

  it("requires checkout address fields", () => {
    const parsed = checkoutSchema.safeParse({
      fullName: "A",
      email: "bad",
      telephone: "",
      streetAddress: "",
      postalCode: "",
      city: "",
      country: "",
    });
    expect(parsed.success).toBe(false);
  });
});
