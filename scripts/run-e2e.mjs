import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const host = "127.0.0.1";
const port = "3000";
const baseUrl = `http://${host}:${port}`;

const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "-H", host, "-p", port],
  {
    env: {
      ...process.env,
      OPENNEXT_DEV_INIT: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
);

server.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[next] ${chunk}`));

let exitCode = 1;

try {
  await waitForServer();
  exitCode = await runPlaywright();
} finally {
  await stopServer();
}

process.exit(exitCode);

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next dev server exited early with code ${server.exitCode}.`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.status < 500) return;
    } catch {
      // Server is still booting.
    }
    await delay(500);
  }
  throw new Error("Timed out waiting for Next dev server.");
}

function runPlaywright() {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test"],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PLAYWRIGHT_BASE_URL: baseUrl,
        },
      }
    );
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function stopServer() {
  if (server.exitCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        stdio: "ignore",
      }).on("exit", resolve);
    });
    return;
  }
  server.kill("SIGTERM");
}
