import { describe, expect, it } from "vitest";
import { altTextFromFilename, unnamedArtworkTitle } from "../lib/batch-artworks";

describe("batch artwork helpers", () => {
  it("uses the shared unnamed artwork title", () => {
    expect(unnamedArtworkTitle).toBe("Unnamed artwork");
  });

  it("creates image text from filenames", () => {
    expect(altTextFromFilename("red_marker-study_01.JPG")).toBe("Red marker study 01");
    expect(altTextFromFilename("x.webp")).toBe("Artwork image");
  });
});
