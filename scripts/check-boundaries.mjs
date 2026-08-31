// Layer-boundary enforcement: the architecture is real only while it is
// checked. Run via `bun run boundaries` (wired into check/verify).
//
// Graph (arrows = allowed import direction):
//   (app root: App.tsx, main.tsx, *.d.ts) -> everything
//   domain  -> utils (shared kernel of pure helpers), constants, errors
//   repositories -> domain, constants, errors
//   services -> domain, repositories, constants, errors, utils, lib
//   store -> domain, services, constants, errors, utils, lib
//   hooks -> domain, services, store, constants, errors, utils, lib
//   features -> everything (feature UIs compose the whole graph)
//   components -> shared UI kit; not features (features import the kit)
//   constants/errors -> shared vocabulary; may reference domain values
//   utils/lib -> leaves below services

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "src");

const DENY = {
  domain: ["repositories", "services", "store", "components", "features", "hooks", "lib"],
  repositories: ["services", "store", "components", "features", "hooks", "utils", "lib"],
  services: ["store", "components", "features", "hooks"],
  store: ["components", "features", "hooks"],
  hooks: ["components", "features"],
  features: [],
  components: ["features"],
  // The composition root wires every layer — it may import everything.
  di: [],
  // Shared vocabulary may reference domain values (policy constants, the
  // errors facade) — domain imports neither, so the graph stays acyclic.
  constants: ["repositories", "services", "store", "components", "features", "hooks", "utils", "lib", "errors"],
  errors: ["repositories", "services", "store", "components", "features", "hooks", "utils", "lib", "constants"],
  utils: ["domain", "repositories", "services", "store", "components", "features", "hooks", "lib"],
  lib: ["domain", "repositories", "services", "store", "components", "features", "hooks", "utils"],
};

const layerOf = (path) => path.split(/[\\/]/)[0] ?? "";

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
const seenLayers = new Set();
// Root-level files (App.tsx, main.tsx, ambient .d.ts) are the app shell.
const ROOT_FILES = new Set(["App.tsx", "main.tsx", "affine-templates.d.ts", "pdfmake.d.ts"]);
for (const file of listFiles(ROOT)) {
  const rel = file.slice(ROOT.length + 1).replaceAll("\\", "/");
  const from = layerOf(rel);
  if (ROOT_FILES.has(rel)) {
    seenLayers.add("(root)");
    continue;
  }
  seenLayers.add(from);
  const rules = DENY[from];
  // An unregistered layer is itself a violation — new folders must join the
  // graph deliberately.
  if (!rules) {
    violations.push(`${rel} (unknown layer "${from}" — register it in check-boundaries.mjs)`);
    continue;
  }
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
const unregistered = [...seenLayers].filter((l) => l !== "(root)" && !DENY[l]);
if (unregistered.length > 0) {
  console.error(`unregistered layers: ${unregistered.join(", ")}`);
  process.exit(1);
}
console.log("boundaries: OK");
