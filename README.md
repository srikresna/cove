# Cove Notes 📝

A desktop note-taking application with block-based editing, AES-256-GCM encryption, and multi-workspace management.

## Core Stack & Architecture
- **Framework**: Tauri v2 (Rust Backend + React 18 / TypeScript Frontend)
- **Editor Engine**: BlockNote (Notion-like Block Editor)
- **Persistence**: SQLite (`sqlite:cove.db`) via Tauri SQL Plugin
- **Encryption**: Passphrase-based AES-256-GCM. Note content is encrypted at rest with a random per-vault DEK, wrapped by a key derived from your passphrase — **Argon2id** (m=64 MiB, t=3, p=4, executed in Rust) for new vaults, with PBKDF2-HMAC-SHA256 (600k iterations) retained for pre-Argon2 vaults. The key is held in memory only while the vault is unlocked and is wiped on close / 15-min idle. **Settings → "Trust this device"** (opt-in, off by default) keeps a device-bound (Windows DPAPI) DEK copy in the OS keychain — enabling auto-unlock on launch and forgot-passphrase recovery on that device, at the cost of letting anyone in the OS session bypass the passphrase. Threat model: strong against an offline DB thief; with "Trust this device" enabled, a live OS-session attacker can recover via the keychain — intentionally not zero-knowledge recovery. Note titles, workspace names, and timestamps are NOT encrypted (they power search and lists). See [docs/CRYPTO_VAULT_BLUEPRINT.md](./docs/CRYPTO_VAULT_BLUEPRINT.md).
- **UI Components**: Radix UI Primitives, CMDK Command Palette, Framer Motion, Tailwind CSS 3
- **Build & Tools**: Vite 6, Biome, Vitest, Bun

## Development Setup

### Prerequisites
- Bun — the canonical package manager for this repo (`bun.lock` is the only lockfile; do not commit a `package-lock.json`)
- Rust & Cargo toolchain (`rustc`, `cargo`)

### Installation & Run

```bash
# Install dependencies
bun install

# Run Web Development Server
bun run dev

# Launch Desktop Application
bun run tauri dev

# Build Production Binary
bun run build
bun run tauri build
```

### Quality Gate

```bash
# Lint + typecheck + tests (with coverage thresholds) + production build
bun run verify

# Rust checks
cd src-tauri && cargo test && cargo clippy
```

## License
MIT License. See [LICENSE](./LICENSE) for details.
