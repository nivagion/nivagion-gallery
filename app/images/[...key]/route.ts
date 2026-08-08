import { getArtworkBucket } from "../../../lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  return imageResponse(request, params, true);
}

export async function HEAD(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  return imageResponse(request, params, false);
}

async function imageResponse(request: Request, params: Promise<{ key: string[] }>, includeBody: boolean) {
  const { key } = await params;
  const objectKey = key.join("/");
  const bucket = getArtworkBucket();
  if (!bucket) return new Response("Image storage is not configured.", { status: 404 });
  const object = await bucket.get(objectKey);
  if (!object || !("body" in object)) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const includeDiagnostics = url.searchParams.has("debug");
  const forceContentLength = url.searchParams.get("debugContentLength") === "1";
  const headers = new Headers();
  applyHttpMetadata(headers, object.httpMetadata);
  headers.set("etag", object.httpEtag);
  headers.set("content-type", object.httpMetadata?.contentType ?? headers.get("content-type") ?? "application/octet-stream");
  headers.set("cache-control", "no-store");
  if (forceContentLength) {
    headers.set("content-length", object.size.toString());
  }
  if (includeDiagnostics) {
    headers.set("x-r2-object-size", object.size.toString());
    headers.set("x-r2-body-used-before-response", String(object.bodyUsed));
    headers.set("x-request-range", request.headers.get("range") ?? "");
    headers.set("x-r2-content-encoding", object.httpMetadata?.contentEncoding ?? headers.get("content-encoding") ?? "");
    headers.set("x-debug-content-length", forceContentLength ? "set-from-r2-size" : "omitted");
  }
  return new Response(includeBody ? object.body : null, { headers });
}

function applyHttpMetadata(headers: Headers, metadata: R2HTTPMetadata | undefined) {
  if (!metadata) return;
  if (metadata.contentType) headers.set("content-type", metadata.contentType);
  if (metadata.contentLanguage) headers.set("content-language", metadata.contentLanguage);
  if (metadata.contentDisposition) headers.set("content-disposition", metadata.contentDisposition);
  if (metadata.contentEncoding) headers.set("content-encoding", metadata.contentEncoding);
  if (metadata.cacheControl) headers.set("cache-control", metadata.cacheControl);
  if (metadata.cacheExpiry) headers.set("expires", metadata.cacheExpiry.toUTCString());
}
