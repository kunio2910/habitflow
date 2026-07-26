import { mkdtemp, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const apiRoute = path.join(projectRoot, "app", "api", "sync", "route.js");
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "habitflow-pages-build-")
);
const parkedApiRoute = path.join(temporaryDirectory, "route.js");
const nextCli = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

let apiRouteParked = false;

try {
  // GitHub Pages only hosts static files. Keep the Sheets API in the Sites
  // build, but omit it while Next.js creates the static Pages artifact.
  await rename(apiRoute, parkedApiRoute);
  apiRouteParked = true;
  await rm(path.join(projectRoot, ".next"), { recursive: true, force: true });

  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_STATIC_PAGES: "true",
      NEXT_PUBLIC_SYNC_APP_URL:
        process.env.NEXT_PUBLIC_SYNC_APP_URL ||
        "https://habitflow-quan-ly-thoi-quen.alibaba0903.chatgpt.site"
    },
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  if (apiRouteParked) await rename(parkedApiRoute, apiRoute);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
