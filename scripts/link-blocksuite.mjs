import { existsSync, mkdirSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const coveRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(coveRoot, "vendor");

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
    if (existsSync(linkPath)) rmSync(linkPath, { recursive: true, force: true });
    try {
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
