# Cove Notes 📝

A desktop note-taking application with block-based editing, AES-256-GCM encryption, and multi-workspace management.

## Core Stack & Architecture
- **Framework**: Tauri v2 (Rust Backend + React 18 / TypeScript Frontend)
- **Editor Engine**: BlockNote (Notion-like Block Editor)
- **Persistence**: SQLite (`sqlite:cove.db`) via Tauri SQL Plugin
- **Encryption**: Passphrase-based AES-256-GCM (WebCrypto + PBKDF2). Note content is encrypted at rest with a per-vault DEK derived from your passphrase (PBKDF2-HMAC-SHA256, 600k iterations); the key is held in memory only while the vault is unlocked and is wiped on close / 15-min idle. A DEK recovery backup is stored in the OS keychain (Windows Credential Manager / macOS Keychain / Linux Secret Service) for trusted-device recovery. **Settings → "Trust this device"** optionally auto-unlocks from that keychain on launch (no passphrase prompt) — convenient, but it shifts the runtime gate to the OS session (disable for a passphrase on every launch). Threat model: strong against an offline DB thief; a live OS-session attacker can recover via the keychain — this is intentionally not zero-knowledge recovery. See [docs/CRYPTO_VAULT_BLUEPRINT.md](./docs/CRYPTO_VAULT_BLUEPRINT.md).
- **UI Components**: Radix UI Primitives, CMDK Command Palette, Framer Motion, Tailwind CSS 3
- **Build & Tools**: Vite 6, Biome, Bun / Node.js

## Development Setup

### Prerequisites
- Bun (or Node.js)
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

## License
MIT License. See [LICENSE](./LICENSE) for details.
