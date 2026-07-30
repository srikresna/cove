/**
 * After building BlockSuite packages (scripts/build-blocksuite), this updates
 * each package's `exports` field to point at `./dist/*.js` (compiled, no accessor)
 * instead of `./src/*.ts` (source). Run AFTER the build + BEFORE vite dev/build.
 *
 * Usage: node scripts/update-blocksuite-exports.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const coveRoot = resolve(scriptDir, "..");
const affineBsRoot = resolve(coveRoot, "Affine", "blocksuite");

function findPackages(dir, results = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const fullPath = join(dir, entry.name);
    const pkgPath = join(fullPath, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        if (typeof pkg.name === "string" && pkg.name.startsWith("@blocksuite/")) {
          results.push({ name: pkg.name, dir: fullPath });
        }
      } catch {}
    }
    findPackages(fullPath, results);
  }
  return results;
}

const packages = findPackages(affineBsRoot);
console.log(`Scanning ${packages.length} packages for export updates...`);

let updated = 0;
let skipped = 0;

for (const { name, dir } of packages) {
  const pkgPath = join(dir, "package.json");
  const distDir = join(dir, "dist");
  if (!existsSync(distDir)) { skipped++; continue; }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (!pkg.exports) { skipped++; continue; }

  let changed = false;
  for (const [key, value] of Object.entries(pkg.exports)) {
    if (typeof value === "string" && value.startsWith("./src/") && value.endsWith(".ts")) {
      pkg.exports[key] = value.replace("./src/", "./dist/").replace(/\.ts$/, ".js");
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`  UPDATED: ${name}`);
    updated++;
  } else {
    skipped++;
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
