/**
 * Links vendored @blocksuite/* + @affine/templates packages from ./vendor/ into
 * node_modules/ via symlinks. Run automatically via `postinstall`.
 *
 * On Windows uses "junction" (no admin privileges required); on POSIX uses
 * "dir" (regular directory symlink). Cross-platform safe.
 *
 * The vendor/ directory contains pre-built BlockSuite 0.27.0 dist packages
 * (committed to the repo). This script makes them resolvable by Vite/tsc by
 * creating junction links in node_modules/ — bun install doesn't manage these
 * packages (they're not in package.json), so it may prune them; this script
 * re-creates them on every install.
 *
 * Usage: node scripts/link-blocksuite.mjs
 */
import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const coveRoot = resolve(scriptDir, "..");
const vendorDir = join(coveRoot, "vendor");

/** Create junctions for all packages under vendor/@<scope>/<name> → node_modules/@<scope>/<name>. */
function linkScope(scope) {
  const vendorScope = join(vendorDir, scope);
  if (!existsSync(vendorScope)) return { linked: 0, failed: 0 };

  const nmScope = join(coveRoot, "node_modules", scope);
  if (!existsSync(nmScope)) mkdirSync(nmScope, { recursive: true });

  let linked = 0;
  let failed = 0;
  for (const entry of readdirSync(vendorScope, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const source = join(vendorScope, entry.name);
    if (!existsSync(join(source, "package.json"))) continue;
    const linkPath = join(nmScope, entry.name);
    // Only remove + recreate the specific package dir (preserve npm-installed
    // packages in the same scope, e.g. @blocksuite/icons from npm).
    if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true });
    try {
      // Windows: "junction" doesn't require admin privileges. POSIX: "dir" is
      // a regular directory symlink (type is largely ignored on POSIX, but
      // being explicit avoids edge cases).
      const linkType = process.platform === "win32" ? "junction" : "dir";
      symlinkSync(source, linkPath, linkType);
      linked++;
    } catch (err) {
      console.error(`  FAIL: ${scope}/${entry.name}: ${err.message}`);
      failed++;
    }
  }
  return { linked, failed };
}

console.log("Linking vendored packages from ./vendor/ ...");

let totalLinked = 0;
let totalFailed = 0;

for (const scope of ["@blocksuite", "@affine"]) {
  const { linked, failed } = linkScope(scope);
  totalLinked += linked;
  totalFailed += failed;
  if (linked > 0) console.log(`  ${scope}: ${linked} linked`);
}

console.log(`\nDone: ${totalLinked} linked, ${totalFailed} failed.`);
if (totalFailed > 0) process.exit(1);
