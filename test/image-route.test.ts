import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, HEAD } from "../app/images/[...key]/route";

const mocks = vi.hoisted(() => ({
  bucket: null as null | { get: ReturnType<typeof vi.fn> },
}));

vi.mock("../lib/db/client", () => ({
  getArtworkBucket: () => mocks.bucket,
}));

describe("artwork image route", () => {
  beforeEach(() => {
    mocks.bucket = null;
  });

  it("streams a full multi-megabyte R2 object without truncation", async () => {
    const source = makeBytes(4 * 1024 * 1024 + 123);
    const get = vi.fn(async () => r2Object(source, "image/jpeg", '"etag-large"'));
    mocks.bucket = { get };

    const response = await GET(new Request("https://example.test/images/artworks/a/b?v=test"), {
      params: Promise.resolve({ key: ["artworks", "a", "b"] }),
    });
    const received = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(get).toHaveBeenCalledWith("artworks/a/b");
    expect(received.byteLength).toBe(source.byteLength);
    expect(sha256(received)).toBe(sha256(source));
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("etag")).toBe('"etag-large"');
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.has("content-length")).toBe(false);
  });

  it("uses a fresh R2 stream for simultaneous full GET requests", async () => {
    const source = makeBytes(2 * 1024 * 1024 + 777);
    const get = vi.fn(async () => r2Object(source, "image/png", '"etag-parallel"'));
    mocks.bucket = { get };

    const responses = await Promise.all(
      Array.from({ length: 3 }, () =>
        GET(new Request("https://example.test/images/artworks/a/b"), {
          params: Promise.resolve({ key: ["artworks", "a", "b"] }),
        })
      )
    );
    const bodies = await Promise.all(responses.map(async (response) => new Uint8Array(await response.arrayBuffer())));

    expect(get).toHaveBeenCalledTimes(3);
    expect(bodies.every((body) => body.byteLength === source.byteLength)).toBe(true);
    expect(bodies.every((body) => sha256(body) === sha256(source))).toBe(true);
  });

  it("returns metadata without a body for HEAD", async () => {
    const source = makeBytes(1024);
    mocks.bucket = { get: vi.fn(async () => r2Object(source, "image/webp", '"etag-head"')) };

    const response = await HEAD(new Request("https://example.test/images/artworks/a/b"), {
      params: Promise.resolve({ key: ["artworks", "a", "b"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("etag")).toBe('"etag-head"');
    expect((await response.arrayBuffer()).byteLength).toBe(0);
  });

  it("exposes opt-in diagnostics and can force Content-Length for comparison", async () => {
    const source = makeBytes(2048);
    mocks.bucket = { get: vi.fn(async () => r2Object(source, "image/jpeg", '"etag-debug"')) };

    const response = await GET(new Request("https://example.test/images/artworks/a/b?debug=1&debugContentLength=1"), {
      params: Promise.resolve({ key: ["artworks", "a", "b"] }),
    });

    expect(response.headers.get("content-length")).toBe(String(source.byteLength));
    expect(response.headers.get("x-r2-object-size")).toBe(String(source.byteLength));
    expect(response.headers.get("x-r2-body-used-before-response")).toBe("false");
    expect(response.headers.get("x-debug-content-length")).toBe("set-from-r2-size");
  });
});

function r2Object(source: Uint8Array, contentType: string, etag: string) {
  return {
    body: streamFromBytes(source),
    bodyUsed: false,
    httpEtag: etag,
    httpMetadata: { contentType },
    size: source.byteLength,
    writeHttpMetadata(headers: Headers) {
      headers.set("content-type", contentType);
    },
  };
}

function streamFromBytes(source: Uint8Array) {
  let offset = 0;
  const chunkSize = 64 * 1024;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= source.byteLength) {
        controller.close();
        return;
      }
      const end = Math.min(offset + chunkSize, source.byteLength);
      controller.enqueue(source.slice(offset, end));
      offset = end;
    },
  });
}

function makeBytes(size: number) {
  const bytes = new Uint8Array(size);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = index % 251;
  }
  return bytes;
}

function sha256(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}
