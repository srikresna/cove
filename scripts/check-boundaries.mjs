// Layer-boundary enforcement: the architecture is real only while it is
// checked. Run via `bun run boundaries` (wired into check/verify).
//
// Graph (arrows = allowed import direction):
//   domain  -> (nothing internal)
//   repositories -> domain, errors
//   services -> domain, repositories, errors, constants, utils, lib
//   store -> domain, services, errors, constants, utils, lib
//   hooks -> domain, services, store, errors, constants, utils, lib
//   components -> everything
//   constants/errors/utils/lib -> (leaves: npm + intra-folder only)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(process.cwd(), "src");

const DENY = {
  domain: ["repositories", "services", "store", "components", "hooks", "constants", "errors", "utils", "lib"],
  repositories: ["services", "store", "components", "hooks", "constants", "utils", "lib"],
  services: ["store", "components", "hooks"],
  store: ["components", "hooks"],
  hooks: ["components"],
  components: [],
  constants: ["domain", "repositories", "services", "store", "components", "hooks", "utils", "lib", "errors"],
  errors: ["domain", "repositories", "services", "store", "components", "hooks", "utils", "lib", "constants"],
  utils: ["domain", "repositories", "services", "store", "components", "hooks", "constants", "errors", "lib"],
  lib: ["domain", "repositories", "services", "store", "components", "hooks", "constants", "errors", "utils"],
};

const layerOf = (path) => path.split(sep)[0] ?? "";

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const IMPORT_RE = /(?:import|export)\s[^"'`]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s*["']([^"']+)["']/g;

const violations = [];
for (const file of listFiles(ROOT)) {
  const rel = file.slice(ROOT.length + 1).replaceAll("\\", "/");
  const from = layerOf(rel);
  const rules = DENY[from];
  if (!rules) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3];
    if (!spec) continue;
    let target = null;
    if (spec.startsWith("@/")) target = spec.slice(2);
    else if (spec.startsWith(".")) target = normalize(join(dirname(rel), spec)).replaceAll("\\", "/");
    else continue; // npm package
    const to = layerOf(target);
    if (to && to !== from && rules.includes(to)) {
      violations.push(`${rel} -> ${spec} (${from} may not import ${to})`);
    }
  }
}

if (violations.length > 0) {
  console.error(`boundary violations: ${violations.length}`);
  for (const v of violations) console.error(`  ${v}`);
  process.exit(1);
}
console.log("boundaries: OK");
