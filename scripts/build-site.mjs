import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public");

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

for (const name of ["docs", "catalog", "assets"]) {
  await fs.cp(path.join(root, name), path.join(outDir, name === "docs" ? "" : name), {
    recursive: true
  });
}
