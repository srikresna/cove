# Cove Notes 📝

A desktop note-taking application with block-based editing, AES-256-GCM encryption, and multi-workspace management.

## Core Stack & Architecture
- **Framework**: Tauri v2 (Rust Backend + React 18 / TypeScript Frontend)
- **Editor Engine**: BlockNote (Notion-like Block Editor)
- **Persistence**: SQLite (`sqlite:cove.db`) via Tauri SQL Plugin
- **Encryption**: Client-side AES-256-GCM (WebCrypto). Note content is encrypted at rest in SQLite using a per-device key held in the app's local storage. This is **not** password-based encryption (there is no PBKDF2/passphrase) — it protects against casual reads of the database file, not against an attacker who gains disk/profile access.
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
