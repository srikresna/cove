# Cove Notes

A joyful, privacy-first desktop note-taking app with block-based editing, multi-workspace support, and client-side encryption. Built with Tauri, React, and BlockSuite.

## Features

- **Block-based editing** — powered by [BlockSuite](https://blocksuite.io/) (the same editor framework as [AFFiNE](https://affine.pro/))
- **Client-side encryption** — all note content is encrypted at rest with AES-GCM via a session DEK; the vault locks automatically on idle and purges plaintext from memory
- **Multi-workspace** — organize notes across isolated workspaces with per-workspace search, tags, and properties
- **Edgeless canvas** — visual thinking with shapes, frames, connectors, and a full presentation mode
- **Bi-directional links** — backlinks + outgoing links, @-mention doc linking, and a command-palette quick search (Ctrl+K)
- **Peek view** — quick preview of referenced notes without leaving the current context
- **Export** — Markdown, HTML, PDF (with local font bundling for offline PDF generation)
- **Properties** — custom per-note properties (text, number, select, status, date, checkbox, URL, relation)
- **Calendar** — chronological note navigation with cover images

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop runtime | [Tauri v2](https://tauri.app/) (Rust + WebView2/WebKit) |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Editor | BlockSuite 0.27 (vendored from AFFiNE via symlink junctions) |
| State | Zustand |
| Database | SQLite (WAL mode, via `tauri-plugin-sql`) |
| Encryption | AES-GCM with Argon2id/PBKDF2 key derivation |
| Key storage | OS keychain (Windows DPAPI / macOS Keychain) |
| Build | Vite 6 + Bun |
| Testing | Vitest + Testing Library |
| Linting | Biome |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (or [Bun](https://bun.sh/) 1.1+)
- [Rust](https://rustup.rs/) (stable toolchain)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) (WebView2 on Windows, Xcode CLT on macOS)

## Getting Started

```bash
# Clone
git clone https://github.com/<your-org>/cove-notes.git
cd cove-notes

# Install dependencies (runs postinstall script that symlinks BlockSuite)
bun install
# or: npm install

# Start the dev server + Tauri window
bun run tauri dev
# or: npm run tauri dev
```

The app opens at `http://localhost:1420` inside a Tauri desktop window.

### BlockSuite Vendoring

Cove consumes BlockSuite from a local checkout of the [AFFiNE monorepo](https://github.com/toeverything/AFFiNE) via symlink junctions. The `AFFiNE/` directory is **gitignored** (too large for the repo). To set up BlockSuite locally:

1. Clone AFFiNE into `./AFFiNE/` (or symlink it).
2. Build BlockSuite packages: `cd AFFiNE && pnpm install && pnpm build`.
3. Run `node scripts/link-blocksuite.mjs && node scripts/update-blocksuite-exports.mjs` (this is automatic via `postinstall`).

Without `AFFiNE/`, `bun install` will fail at the postinstall step.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Vite dev server (browser only, no Tauri) |
| `bun run tauri dev` | Start Tauri + Vite (full desktop app) |
| `bun run build` | Production build (Vite output to `dist/`) |
| `bun run test` | Run all tests (Vitest) |
| `bun run test:ci` | Run tests with coverage report |
| `bun run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `bun run check` | Lint + format check (Biome) |
| `bun run verify` | Full CI pipeline: lint → typecheck → test+coverage → build |

## Project Structure

```
src/
├── components/        # React UI (editor, modals, sidebar, right bar)
├── constants/         # App constants + i18n message strings
├── di/                # Dependency injection container (service composition root)
├── domain/            # Domain models (Note, Property, errors)
├── lib/               # Cross-cutting utilities (fullscreen shim, disposable guard)
├── repositories/      # SQLite data access layer
├── services/          # Business logic (NoteService, VaultService, BlockSuiteEditorService, …)
│   ├── blocksuite/    # BlockSuite integration (editor service, providers, peek, templates)
│   ├── editor/        # Doc codec, content format, block-tree normalizer
│   └── vault/         # Crypto vault, blob source, keychain
├── store/             # Zustand state stores (note, workspace, settings, UI)
├── types/             # Shared TypeScript types
└── utils/             # Pure utility functions
src-tauri/
├── src/               # Rust backend (crypto, backup/restore, transactions)
├── capabilities/      # Tauri permission config
└── Cargo.toml         # Rust dependencies
scripts/
├── link-blocksuite.mjs        # Postinstall: symlink @blocksuite/* → AFFiNE/blocksuite/*
└── update-blocksuite-exports.mjs  # Postinstall: patch BlockSuite package exports
tests/                 # Vitest test suite (services, repositories, errors)
```

## Architecture

Cove follows a **layered clean architecture**:

- **Domain** → pure models, no infra dependencies
- **Repositories** → SQLite data access (via `tauri-plugin-sql` pool)
- **Services** → business logic with interfaces (`I*Service`) + implementations, composed in `di/container.ts`
- **Stores** → Zustand for React-facing state (one-way dependency: stores → services)
- **Components** → React UI consuming stores + services

BlockSuite integration is isolated in `services/blocksuite/` — the editor service manages workspace lifecycle, doc loading, feature flags, and blob storage. It is free of zustand imports (state injected via provider callbacks).

## License

[MIT](LICENSE) (or your chosen license)

## Acknowledgements

- [BlockSuite](https://github.com/toeverything/blocksuite) — the block editor framework
- [AFFiNE](https://github.com/toeverything/AFFiNE) — the open-source knowledge base that Cove's editor integration mirrors
- [Tauri](https://tauri.app/) — the desktop app framework
