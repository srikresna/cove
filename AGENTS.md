# AGENTS.md

Guidance for AI agents and human contributors working on Cove.

## What is Cove

Cove is a local-first, end-to-end encrypted notes app built with Tauri (Rust backend) + React (frontend). Note content is encrypted with AES-256-GCM; keys are derived from a passphrase via Argon2id (Rust). It integrates BlockSuite (vendored) for the rich-text/edgeless canvas editor.

## Prerequisites

- **Node** 20+ and **npm** (or bun)
- **Rust** toolchain (for the Tauri backend)
- **Windows**: native. macOS/Linux: postinstall junction script needs a POSIX symlink fallback (see #12 in the audit — pending).

## Setup

```sh
npm install          # runs postinstall → scripts/link-blocksuite.mjs (creates vendor → node_modules junctions)
npm run tauri dev    # full app (Rust + Vite dev server, port 1420)
```

`vendor/` contains pre-built BlockSuite 0.27 dist packages + @affine/templates. They are committed to the repo and junctioned into `node_modules/` by the postinstall script. **Cove is fully independent of any sibling AFFiNE/ directory.**

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server only (port 1420) |
| `npm run tauri dev` | Full app: Rust + Vite |
| `npm run build` | Production frontend build (`dist/`) |
| `npm run typecheck` | `tsc --noEmit` on source |
| `npm run typecheck:tests` | `tsc` on test sources |
| `npm run typecheck:node` | `tsc` on config files (vite/vitest/tailwind/postcss) |
| `npm run test` | Vitest (run once) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:ci` | Vitest with coverage |
| `npm run check` | Biome lint+format check (`src` + `tests`) |
| `npm run format` | Biome auto-format (`src` + `tests`) |
| `npm run verify` | Full CI gate: biome + typecheck + test + build |

**Run these before committing:** `npm run check && npm run typecheck && npm run test`

## Architecture

Clean architecture with strict layering, enforced by `scripts/check-boundaries.mjs` (run via `bun run boundaries`; wired into `check` and `verify`):

```
src/
  domain/        pure logic + formatters + error types (may use utils as shared kernel)
  repositories/  persistence interfaces + SQLite impls (I*Repository)
  services/      orchestration with I*Service contracts
  store/         zustand client state + TanStack Query cache/actions (noteActions, queryClient)
  hooks/         React data hooks (useNotes, useTrash, …)
  features/      feature UIs (editor, library, modals, settings, sidebar, trash, vault)
  components/    shared UI kit only (ui/, ErrorBoundary, ToastContainer)
  di/            dependency injection wiring (container.ts) — may import everything
  constants/ errors/ utils/ lib/   shared vocabulary + pure helpers
```

**Dependency direction:** `features → hooks/store → services → repositories → domain`. Server state lives in the TanStack Query cache (`src/store/queryClient.ts`); zustand holds only client state. Repo writes publish change topics (`services/changeBus.ts`) that invalidate queries. An unknown top-level folder is a boundary violation — new layers must be registered in the gate script.

## BlockSuite integration

- `src/services/blocksuite/BlockSuiteEditorService.ts` — workspace lifecycle, doc open/normalize, export/import
- `src/services/editor/BlockTreeNormalizer.ts` — `normalizeBlockTree()`: repairs corrupted snapshots (multi-surface merge + element dedup). Safety-critical — has tests.
- `src/features/editor/blocksuite/BlockSuiteSurface.tsx` — mounts the editor, debounced save, presentation, pointer/autocomplete guards
- `src/features/editor/blocksuite/peek/PeekViewModal.tsx` — peek view for embedded frames/mindmaps

### Vendored BlockSuite

`vendor/@blocksuite/` — committed dist (60+ packages). `scripts/link-blocksuite.mjs` junctions them into `node_modules/` on postinstall. Do NOT edit vendored files — patch Cove-side instead (see `src/lib/disposableGuard.ts` for the prototype-override pattern).

### Signals / Yjs pinning

`@preact/signals-core` and `yjs` resolve from Cove's own `node_modules` (single instance via `resolve.dedupe` in `vite.config.ts`). `tsconfig.json` paths match. Do not change without verifying the toolbar active-state reactivity still works.

## Security

- Note content, titles, covers, and blobs are encrypted at rest (AES-256-GCM with AAD).
- The session DEK is a non-extractable `CryptoKey`; raw bytes are zeroized on lock.
- `vaultService.onLock(resetEngine)` tears down the BlockSuite workspace + clears caches on lock.
- SQL is parameterized everywhere. CSP is strict (`script-src 'self'`).
- Never log or expose keys, passphrases, or decrypted content.

## Testing

- Tests in `tests/` (mirror `src/` structure). Fakes in `tests/fakes/`.
- Coverage gates: 70% on `src/services`, `src/errors`, `src/domain`.
- Priority test targets: `BlockTreeNormalizer`, `VaultService`, `NoteService`, stores with optimistic-update/rollback.

## Code style

- **Biome** for lint + format (LF line endings). `npm run format` to auto-fix.
- No `any` without a `biome-ignore` + justification.
- No `console.log` in source (use `console.warn`/`console.error`; both are allowed by the lint config).
- TypeScript strict mode with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`.
