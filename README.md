# Cove Notes 📝

A desktop note-taking application with block-based editing, AES-256-GCM encryption, multi-workspace management, and Superr Design System interface.

## Core Stack & Architecture
- **Framework**: Tauri v2 (Rust Backend + React 18 / TypeScript Frontend)
- **Editor Engine**: BlockNote (Notion-like Block Editor)
- **Persistence**: SQLite (`sqlite:cove.db`) via Tauri SQL Plugin
- **Encryption**: Client-Side Zero-Knowledge AES-256-GCM (WebCrypto API with PBKDF2)
- **UI Components**: Radix UI Primitives, CMDK Command Palette, Framer Motion, Tailwind CSS 3
- **Build & Tools**: Vite 6, Biome, Bun / Node.js

## Development Setup

### Prerequisites
- Node.js / Bun
- Rust & Cargo toolchain (`rustc`, `cargo`)

### Installation & Run

```bash
# Install dependencies
npm install

# Run Web Development Server
npm run dev

# Launch Desktop Application
npm run tauri dev

# Build Production Binary
npm run build
npm run tauri build
```

## License
MIT License. See [LICENSE](./LICENSE) for details.
