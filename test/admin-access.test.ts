import { beforeEach, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { requireAdmin } from "../lib/security";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not found"); } }));
vi.mock("../lib/db/client", () => ({
  getEnv: () => ({
    ADMIN_EMAIL: "admin@example.com",
    CF_ACCESS_TEAM_DOMAIN: "example.cloudflareaccess.com",
    CF_ACCESS_AUD: "expected-audience",
  }),
}));

beforeEach(() => {
  mocks.headers.mockReset();
  mocks.headers.mockResolvedValue(new Headers({
    "cf-access-authenticated-user-email": "admin@example.com",
  }));
});

it("rejects a spoofed Access identity header without a signed JWT", async () => {
  await expect(requireAdmin()).rejects.toThrow("not found");
});

it("rejects a malformed Access JWT even if the email header matches", async () => {
  mocks.headers.mockResolvedValue(new Headers({
    "cf-access-authenticated-user-email": "admin@example.com",
    "cf-access-jwt-assertion": "not-a-jwt",
  }));
  await expect(requireAdmin()).rejects.toThrow("not found");
});

it("accepts a correctly signed token for the configured application and email", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...await exportJWK(publicKey), kid: "test-key", alg: "RS256", use: "sig" };
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ keys: [jwk] }), { headers: { "content-type": "application/json" } })
  );
  const token = await new SignJWT({ email: "admin@example.com" })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer("https://example.cloudflareaccess.com")
    .setAudience("expected-audience")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  mocks.headers.mockResolvedValue(new Headers({
    "cf-access-authenticated-user-email": "admin@example.com",
    "cf-access-jwt-assertion": token,
  }));
  try {
    await expect(requireAdmin()).resolves.toEqual({
      email: "admin@example.com",
      mode: "cloudflare-access",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  } finally {
    fetchMock.mockRestore();
  }
});
