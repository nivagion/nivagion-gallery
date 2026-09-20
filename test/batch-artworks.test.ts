import { describe, expect, it } from "vitest";
import { altTextFromFilename, publicArtworkTitle, unnamedArtworkTitle } from "../lib/batch-artworks";

describe("batch artwork helpers", () => {
  it("uses the shared unnamed artwork title", () => {
    expect(unnamedArtworkTitle).toBe("Unnamed artwork");
  });

  it("hides the placeholder artwork title from public pages", () => {
    expect(publicArtworkTitle("Unnamed artwork")).toBe("");
    expect(publicArtworkTitle("  UNNAMED ARTWORK  ")).toBe("");
    expect(publicArtworkTitle("Blue study")).toBe("Blue study");
  });

  it("creates image text from filenames", () => {
    expect(altTextFromFilename("red_marker-study_01.JPG")).toBe("Red marker study 01");
    expect(altTextFromFilename("x.webp")).toBe("Artwork image");
  });
});
