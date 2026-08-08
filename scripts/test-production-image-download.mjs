import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

const defaultUrl =
  "https://nivagion.com/images/artworks/art_f5ce0085-2396-495c-aaee-55cabc1686e6/img_40e06c2c-4837-4422-a955-b28ba91897cd";

const args = parseArgs(process.argv.slice(2));
const target = args.url ?? defaultUrl;
const sequential = numberArg(args.sequential, 20);
const concurrencyLevels = listArg(args.concurrency, [5, 10, 20]);
const slowBytesPerSecond = numberArg(args.slowBps, 0);
const headers = new Headers();

for (const header of args.header ?? []) {
  const separator = header.indexOf(":");
  if (separator === -1) throw new Error(`Invalid --header value: ${header}`);
  headers.append(header.slice(0, separator).trim(), header.slice(separator + 1).trim());
}

if (args.cookie) headers.set("cookie", args.cookie);

console.log(`Target: ${target}`);
console.log(`Sequential requests: ${sequential}`);
console.log(`Concurrent batches: ${concurrencyLevels.join(", ")}`);
if (slowBytesPerSecond > 0) console.log(`Slow consumer: ${slowBytesPerSecond} B/s`);
console.log("");

const sequentialResults = [];
for (let index = 0; index < sequential; index += 1) {
  const result = await download(`${withDebugParam(target, `seq-${index + 1}`)}`, headers, slowBytesPerSecond);
  sequentialResults.push(result);
  printResult(`seq ${index + 1}`, result);
}
printSummary("sequential", sequentialResults);

for (const concurrency of concurrencyLevels) {
  const results = await Promise.all(
    Array.from({ length: concurrency }, (_, index) =>
      download(withDebugParam(target, `concurrency-${concurrency}-${index + 1}`), headers, slowBytesPerSecond)
    )
  );
  for (let index = 0; index < results.length; index += 1) {
    printResult(`c${concurrency} #${index + 1}`, results[index]);
  }
  printSummary(`concurrency ${concurrency}`, results);
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      parsed.url = value;
      continue;
    }
    const [rawName, inlineValue] = value.slice(2).split("=", 2);
    const nextValue = inlineValue ?? values[++index];
    if (rawName === "header") {
      parsed.header = [...(parsed.header ?? []), nextValue];
    } else {
      parsed[rawName] = nextValue;
    }
  }
  return parsed;
}

function numberArg(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid number: ${value}`);
  return parsed;
}

function listArg(value, fallback) {
  if (value === undefined) return fallback;
  return String(value)
    .split(",")
    .map((item) => numberArg(item.trim(), 0))
    .filter((item) => item > 0);
}

async function download(url, headers, slowBytesPerSecond) {
  const started = performance.now();
  const response = await fetch(url, { headers, redirect: "manual" });
  const hash = createHash("sha256");
  let bytes = 0;

  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      hash.update(value);
      if (slowBytesPerSecond > 0) {
        await sleep(Math.ceil((value.byteLength / slowBytesPerSecond) * 1000));
      }
    }
  }

  const elapsedMs = Math.round(performance.now() - started);
  const contentLength = response.headers.get("content-length");
  const r2ObjectSize = response.headers.get("x-r2-object-size");
  const expectedBytes = numberHeader(r2ObjectSize) ?? numberHeader(contentLength);

  return {
    status: response.status,
    contentLength,
    r2ObjectSize,
    bytes,
    sha256: hash.digest("hex"),
    cfRay: response.headers.get("cf-ray"),
    cfCacheStatus: response.headers.get("cf-cache-status"),
    age: response.headers.get("age"),
    etag: response.headers.get("etag"),
    contentType: response.headers.get("content-type"),
    contentEncoding: response.headers.get("content-encoding"),
    location: response.headers.get("location"),
    elapsedMs,
    byteMatch: expectedBytes === undefined ? "unknown" : bytes === expectedBytes,
  };
}

function withDebugParam(url, value) {
  const parsed = new URL(url);
  parsed.searchParams.set("debug", value);
  return parsed.toString();
}

function numberHeader(value) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function printResult(label, result) {
  console.log(
    [
      label,
      `status=${result.status}`,
      `contentLength=${result.contentLength ?? "-"}`,
      `r2Size=${result.r2ObjectSize ?? "-"}`,
      `bytes=${result.bytes}`,
      `sha256=${result.sha256}`,
      `cfRay=${result.cfRay ?? "-"}`,
      `cfCache=${result.cfCacheStatus ?? "-"}`,
      `age=${result.age ?? "-"}`,
      `etag=${result.etag ?? "-"}`,
      `type=${result.contentType ?? "-"}`,
      `encoding=${result.contentEncoding ?? "-"}`,
      `match=${result.byteMatch}`,
      `elapsedMs=${result.elapsedMs}`,
      result.location ? `location=${result.location}` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function printSummary(label, results) {
  const hashes = new Set(results.map((result) => result.sha256));
  const failures = results.filter((result) => result.status !== 200 || result.byteMatch === false);
  console.log(`${label} summary: ${results.length} requests, ${failures.length} failures, ${hashes.size} unique hashes`);
  console.log("");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
