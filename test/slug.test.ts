import { describe, expect, it } from "vitest";
import { slugify, uniqueReference } from "../lib/slug";

describe("slug helpers", () => {
  it("creates URL-safe artwork slugs", () => {
    expect(slugify("Marker Study: Croatia #1")).toBe("marker-study-croatia-1");
  });

  it("creates human-readable order references", () => {
    expect(uniqueReference(new Date("2026-08-04T12:00:00Z"), 0)).toBe("NIV-20260804-0000");
  });
});
