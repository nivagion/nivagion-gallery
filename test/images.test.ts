import { describe, expect, it } from "vitest";
import { validateImageFile } from "../lib/images";

describe("image validation", () => {
  it("accepts PNG content with matching MIME type", async () => {
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "x.png", {
      type: "image/png",
    });
    await expect(validateImageFile(png)).resolves.toMatchObject({ mime: "image/png" });
  });

  it("rejects misleading executable content", async () => {
    const exe = new File([new TextEncoder().encode("MZ fake")], "x.png", {
      type: "image/png",
    });
    await expect(validateImageFile(exe)).rejects.toThrow(/JPEG, PNG, WebP or AVIF/);
  });
});
