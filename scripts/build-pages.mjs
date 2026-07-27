import { access, readdir, rm, writeFile } from "node:fs/promises";
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
if (result.status !== 0) process.exit(result.status ?? 1);

const outputDirectory = new URL("../out/", import.meta.url);
await access(new URL("index.html", outputDirectory));
await access(new URL("_next/", outputDirectory));

const assets = await readdir(new URL("_next/static/", outputDirectory), {
  recursive: true
});
if (!assets.some(file => file.endsWith(".js"))) {
  throw new Error("Bản GitHub Pages không có JavaScript trong out/_next/static");
}

await writeFile(new URL(".nojekyll", outputDirectory), "");
console.log("Đã xác minh out/index.html, tài nguyên _next và tạo .nojekyll.");
