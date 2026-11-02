import { afterEach, describe, expect, it, vi } from "vitest";
import { secureRequest, secureResponse } from "../lib/response-security";

afterEach(() => vi.unstubAllEnvs());

describe("production security boundary", () => {
  it.each([
    ["http://nivagion.com/works?sort=new", "https://nivagion.com/works?sort=new"],
    ["http://www.nivagion.com/admin?view=trash", "https://nivagion.com/admin?view=trash"],
    ["https://www.nivagion.com/images/example.webp?size=large", "https://nivagion.com/images/example.webp?size=large"],
  ])("permanently redirects %s", (source, destination) => {
    vi.stubEnv("NODE_ENV", "production");
    const response = secureRequest(new Request(source)).redirect;
    if (!response) throw new Error("Expected a redirect");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(destination);
    expect(response.headers.get("strict-transport-security")).toBe("max-age=31536000");
  });

  it("sets a fresh nonce and restrictive headers on canonical requests", () => {
    vi.stubEnv("NODE_ENV", "production");
    const firstResult = secureRequest(new Request("https://nivagion.com/works"));
    const secondResult = secureRequest(new Request("https://nivagion.com/works"));
    const first = secureResponse(new Response("ok"), firstResult.csp);
    const second = secureResponse(new Response("ok"), secondResult.csp);
    const policy = first.headers.get("content-security-policy") ?? "";
    expect(first.status).toBe(200);
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("https://media.nivagion.com");
    expect(policy).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(policy).not.toContain("unsafe-eval");
    expect(policy).not.toContain("script-src 'unsafe-inline'");
    expect(second.headers.get("content-security-policy")).not.toBe(policy);
    expect(first.headers.get("x-frame-options")).toBe("DENY");
    expect(first.headers.get("x-content-type-options")).toBe("nosniff");
    expect(first.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(first.headers.get("permissions-policy")).toContain("camera=()");
  });
});
