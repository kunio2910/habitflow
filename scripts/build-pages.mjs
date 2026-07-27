import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url)
);

await rm(new URL("../.next", import.meta.url), { recursive: true, force: true });

const result = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    GITHUB_PAGES: "true"
  },
  stdio: "inherit"
});

if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status ?? 1;
