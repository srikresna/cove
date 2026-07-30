/**
 * Links all @blocksuite/* packages from the AFFiNE repo into Cove's node_modules.
 *
 * The AFFiNE repo (D:\remote\cove\Affine) contains BlockSuite v0.27.0 as source
 * (no dist/). Its packages declare exports → ./src/*.ts, designed to be consumed
 * by Vite directly (like the AFFiNE playground does). This script creates junction
 * links in node_modules/@blocksuite/* pointing to the AFFiNE source directories,
 * so Vite + tsc resolve @blocksuite/* to the live source.
 *
 * Usage: node scripts/link-blocksuite.mjs
 *
 * Prerequisites:
 *   1. yarn install in D:\remote\cove\Affine (installs BlockSuite's external deps)
 *   2. Remove @blocksuite/affine from package.json + npm install (removes old npm pkgs)
 */
import { readdirSync, readFileSync, existsSync, rmSync, mkdirSync, symlinkSync, lstatSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const coveRoot = resolve(scriptDir, "..");
const affineBsRoot = resolve(coveRoot, "Affine", "blocksuite");
const nmBlocksuite = resolve(coveRoot, "node_modules", "@blocksuite");

/** Recursively find all packages with @blocksuite/ names under a directory. */
function findBlockSuitePackages(dir, results = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const fullPath = join(dir, entry.name);
    const pkgJsonPath = join(fullPath, "package.json");
    if (existsSync(pkgJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
        if (typeof pkg.name === "string" && pkg.name.startsWith("@blocksuite/")) {
          results.push({ name: pkg.name, dir: fullPath });
        }
      } catch {
        // invalid package.json — skip
      }
    }
    // Recurse
    findBlockSuitePackages(fullPath, results);
  }
  return results;
}

console.log("Scanning AFFiNE repo for @blocksuite/* packages...");
const packages = findBlockSuitePackages(affineBsRoot);
console.log(`Found ${packages.length} packages.`);

// Sort for deterministic output
packages.sort((a, b) => a.name.localeCompare(b.name));

// Wipe existing node_modules/@blocksuite (removes old npm-installed packages)
if (existsSync(nmBlocksuite)) {
  console.log(`\nRemoving existing ${nmBlocksuite} ...`);
  rmSync(nmBlocksuite, { recursive: true, force: true });
}
mkdirSync(nmBlocksuite, { recursive: true });

// Create junctions
let linked = 0;
let failed = 0;
for (const { name, dir } of packages) {
  const shortName = name.replace("@blocksuite/", "");
  const linkPath = join(nmBlocksuite, shortName);
  try {
    // "junction" works on Windows without admin privileges (directories only)
    symlinkSync(dir, linkPath, "junction");
    linked++;
  } catch (err) {
    console.error(`  FAIL: ${name} → ${dir}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${linked} linked, ${failed} failed.`);
if (failed > 0) process.exit(1);
