import { describe, expect, it } from "vitest";
import {
  artworkWebpQuality,
  maxArtworkImageEdge,
  resizeToMaxEdge,
} from "../lib/client/process-artwork-image";

describe("client artwork image processing math", () => {
  it("resizes landscape images to the max edge", () => {
    expect(resizeToMaxEdge(4000, 3000)).toEqual({ width: 2800, height: 2100 });
  });

  it("resizes portrait images to the max edge", () => {
    expect(resizeToMaxEdge(3000, 4000)).toEqual({ width: 2100, height: 2800 });
  });

  it("does not upscale smaller images", () => {
    expect(resizeToMaxEdge(1200, 800)).toEqual({ width: 1200, height: 800 });
  });

  it("uses the configured upload quality and max dimensions", () => {
    expect(maxArtworkImageEdge).toBe(2800);
    expect(artworkWebpQuality).toBe(0.9);
  });
});
