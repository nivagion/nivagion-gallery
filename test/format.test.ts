import { describe, expect, it } from "vitest";
import { formatMoney } from "../lib/format";

describe("formatMoney", () => {
  it("localizes a missing price", () => {
    expect(formatMoney(null, "EUR", "en")).toBe("Price on request");
    expect(formatMoney(null, "EUR", "hr")).toBe("Cijena na upit");
  });
});
