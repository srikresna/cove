# ⚠️ ERRATA & OVERRIDE — WAJIB BACA SEBELUM EKSEKUSI

Berikut adalah koreksi terverifikasi yang **MENGESAMPINGKAN / melengkapi** instruksi fase di bawah ini bila terjadi konflik. (Sumber: verifikasi independen atas draf mega-prompt; skor kelengkapan awal 82/100.)

**E1 — [FASE 1/5] Editor feedback loop (KRITIS, belum diperbaiki di draf).** Saat memisahkan `updateNote → updateContent` di FASE 1, juga putuskan loop feedback editor. Effect load-content di `BlockNoteEditor.tsx` di-key `[note.content, editor]`; karena `updateContent` menulis `note.content` ke store, effect re-fire → `editor.replaceBlocks` → clobber cursor/undo. Fix: tambah `const isLocalEditRef = useRef(false)`; set `true` di dalam callback debounced-save SEBELUM `updateContent`; guard effect load: `if (isLocalEditRef.current) { isLocalEditRef.current = false; return; }`. Alternatif: key effect pada `[note.id, editor]` + simpan konten terakhir di ref untuk mendeteksi perubahan eksternal sungguhan.

**E2 — [FASE 3] Migrasi legacy plaintext (KRITIS / anti data-loss).** SEBELUM `decryptPayload` menjadi fail-loud, jalankan migrasi satu kali (gate `PRAGMA user_version`) di `initSchema`: scan `notes`; untuk baris yang `content` diawali `[` atau `<` (legacy tidak terenkripsi), **encrypt in-place** via `EncryptionService.encryptPayload`. Tanpa langkah ini, catatan lama/import menjadi **tidak bisa dibuka** setelah fail-loud.

**E3 — [FASE 3] Repo vs Service: not-found.** `getNoteById`/`getWorkspaceById` **TETAP `return null`** untuk 0-row (query kosong = valid, BUKAN swallow error). Repo **THROW `PersistenceError` HANYA** untuk exception DB. Konversi `null → NotFoundError` **HANYA di lapisan service** (`NoteService.duplicateNote/togglePin/toggleFavorite`). Pertahankan kontrak `INoteRepository` (`getNoteById: Note | null`). Jangan throw `NotFoundError` dari repo.

**E4 — Skema version ladder.** `PRAGMA user_version`: **v1** = status quo (workspace init). **v2** = FASE 4 (drop `folderId`, recreate-table). **v3** = FASE 5 (kolom plainText opsional + `notes_fts` + trigger + `idx_notes_workspace_updated`). Tiap fase cek `user_version < target` sebelum migrasi, lalu set versi baru **dalam transaksi yang sama**. FASE 5 **tidak boleh** reuse v2.

**E5 — [FASE 4] Rename COLORS → COVER_COLORS.** `CreateWorkspaceModal.tsx`: const lokal bernama `COLORS` (bukan `COVER_COLORS`); RENAME jadi import `COVER_COLORS` dari `src/constants/app.ts`, hapus deklarasi lokal, update `COLORS.map` → `COVER_COLORS.map` (sekitar L118). Sitasi baris `#ff6f1e` di `EditorHeader.tsx` yang benar: **L20** (array COVER_COLORS), **L72** (×2 di inline style) — BUKAN L62/L143.

**E6 — [FASE 2] Karakterisasi updateNote yang akurat.** Cabang content (sekitar L205-237) = read-modify-write + re-encrypt; cabang metadata (sekitar L239-296) **SUDAH** dynamic UPDATE tanpa re-encrypt. Tujuan FASE 2: (a) hapus read-modify-write cabang content, satukan ke dynamic builder; (b) hapus `BEGIN/COMMIT`; (c) hapus fallback synthetic-note (sekitar L276-288) → ganti `if (!existing) throw new NotFoundError("Note", id)`; (d) post-UPDATE re-fetch: bila `updates.content === undefined`, pakai SELECT **metadata-only** (jangan decrypt sekadar untuk return).

**E7 — [FASE 5] FTS DEFAULT title-only.** Default: FTS atas **`title` SAJA** (tanpa kolom `plainText`), menjaga encryption-at-rest konten. Tambah `FTS_INCLUDE_BODY = false` di `src/constants/app.ts`. Kolom `plainText` + trigger body **HANYA** dibuat bila `FTS_INCLUDE_BODY === true` (keputusan terekam di `CLAUDE.md`). Query & trigger search harus conditional pada flag tsb.

**E8 — [FASE 1/4] Seed data.** `DEFAULT_NOTES`/`DEFAULT_WORKSPACES` (hardcoded, duplikasi literal `#ff6f1e` + welcome content) di-overwrite pada fetch sukses pertama → dead-on-arrival. Pindahkan seeding ke bootstrap/seed-on-first-run service yang menulis ke DB via repo, semua literal dari `src/constants/app.ts`; atau bila dipertahankan sebagai state awal UI, ganti literal inline dengan import konstanta. Hapus duplikasi welcome-content.

**E9 — [FASE 1/5] Forward-proof pagination.** Deklarasikan `listMetadataByWorkspace(workspaceId, cursor?: { updatedAt: number; id: string } | null, limit?: number)` dan `getNotesMetadataByWorkspace(workspaceId, cursor?, limit?)` **sejak FASE 1** (cursor opsional), agar FASE 5 tidak memecah kontrak. Update semua call site saat FASE 5 mengaktifkan cursor.

**E10 — [FASE 6] Coverage + policy test.** `coverage.include` tambah `src/domain/**`. Tambah `src/domain/note/notePolicy.test.ts` (`canDeleteLastWorkspace`, `duplicateNoteProps`, konstanta default).

**E11 — [FASE 6] Mapper test disesuaikan.** Samakan dengan desain mapper-tunggal FASE 2: `mapRowToNote(row, { decrypt: false })` → `content: ""` & **tidak** memanggil decrypt (assert via spy); `{ decrypt: true }` → decrypt. Integer 0/1 → boolean, `null` → `undefined` di kedua mode. (Jangan buat `mapRowToNoteMetadata` terpisah.)

**E12 — [FASE 7] Jangan andalkan nomor baris.** Ganti sitasi nomor baris `console.*` dengan: `rg -n "console\.(error|log|warn|info)" src` lalu ganti SEMUA match di luar `src/services/Logger.ts` → `Logger.*`. Nomor baris sudah **stale** setelah fase 2-5 menulis ulang file-file tsb.

**E13 — Koordinasi lazy content.** Pastikan `loadActiveNoteContent(id)` ada (FASE 5 Langkah 1) **sebelum** `getNotesByWorkspace` dihapus, agar `content: ""` dari metadata **tidak mengalir** ke `BlockNoteEditor` — konten penuh di-load via `getNoteById` saat `activeNoteId` berubah.

**E14 — [FASE 3, KEAMANAN/EKSPEKTASI] README akurat atau implementasi PBKDF2 sungguhan.** `README.md:9` menyatakan "Client-Side Zero-Knowledge AES-256-GCM (WebCrypto API with PBKDF2)" — tetapi `EncryptionService` **tidak** memakai PBKDF2, tidak ada password user; kunci = 32-byte acak per-device yang disimpan **plaintext** di `localStorage` (`cove_device_sec_key`). Klaim "Zero-Knowledge + PBKDF2" menyesatkan: siapa pun yang akses disk/profile punya kuncinya tepat di sebelah DB. Pilih SATU: (a) **Implementasi sungguhan** — minta password saat unlock, `PBKDF2-SHA256(password, salt per-install, ≥600.000 iterasi)` → DEK; simpan HANYA salt + verifier (bukan DEK); DEK di memori sesi saja; atau (b) **Perbaiki README** jadi jujur ("per-device key in WebView local storage; melindungi dari pembacaan DB langsung, BUKAN dari penyerang yang pegang disk/profile; tanpa enkripsi berbasis password"). Default (b) bila passphrase UX di luar scope; (a) jadi roadmap di `docs/security.md`. Sekalian perbaiki README lain: baris `npm install`/`npm run` → `bun`; sebutan "Superr Design System" → konsistenkan brand.

**E15 — [FASE 3, ANTI DATA-LOSS] Key recovery / backup.** Kehilangan `localStorage` (clear app data, reset WebView, migrasi device) = kunci hilang → **semua catatan permanen tak terbaca** (tidak ada derivasi password, tidak ada backup). Tambah jalur recovery: (i) **export backup terenkripsi** (bundle DB + key → file via Tauri fs, password-protected), DAN/ATAU (ii) **recovery phrase** yang merekonstruksi key. **Wajib** bila E14 pilih (b) (kunci random tak terderivasi). Dokumentasikan threat model di `docs/security.md`.

**E16 — [FASE 1/2] initSchema readiness gate (anti race first-run).** Constructor `SQLiteNoteRepository` memanggil `this.initSchema()` **tanpa await** (fire-and-forget) → query pertama setelah launch bisa kalah balapan dengan `CREATE TABLE` → "no such table: notes" → error ditelan → create note gagal diam-diam di first run. Fix: pindahkan inisialisasi schema ke composition root — `SQLiteDatabase.getInstance()` meng-await seluruh migrasi **sebelum** promise-nya resolve; ekspos `await SQLiteDatabase.ready()`; service/store menunggu readiness tsb. Tidak boleh ada query dispatch sebelum readiness resolve.

**E17 — [FASE 1/3] fetchNotes empty/error: reset `activeNoteId`.** `useNoteStore.fetchNotes` cabang hasil-kosong hanya `set({ notes: filter(...), isLoading:false })` — **tidak reset `activeNoteId`** → tetap menunjuk note workspace lain yang tak ada di daftar → editor salah tampil. Fix: cabang kosong wajib `set({ notes: [], activeNoteId: null, isLoading:false })`. Karena repo kini fail-loud (E3), bedakan "kosong" (reset `activeNoteId=null`) vs "error" (toast + **pertahankan list lama**, jangan replace dengan `[]`).

**E18 — [FASE 1/3] `createWorkspace`: rollback, jangan return ghost.** `useWorkspaceStore.createWorkspace` catch (sekitar L103-106) mengembalikan `{ ...newWsInput, createdAt }` yang **tak pernah dipersist** → UI tampilkan workspace hantu; note dibuat di `workspaceId` tak-eksis di DB → yatim/hilang saat reload. Fix: mirror pola `createNote` — snapshot `previousWorkspaces`, saat gagal `set({ workspaces: previousWorkspaces, activeWorkspaceId: <prev> })`, throw/return `null` (bukan object hantu), `presentError` → toast.

**Catatan (sudah tercakup — jangan dobel):** rantai destruksi data "decrypt-gagal → re-encrypt sampah" (klaim #3) dicegah oleh **kombinasi** FASE-3 fail-loud (decrypt THROW, bukan `return ciphertext`) + errata E6 (hapus read-modify-write cabang content) — pastikan KEDUA tuntas. Klaim #5 (interleave transaksi) → FASE 2 (hapus BEGIN/COMMIT per-statement + `withTransaction`). Klaim #6 (loop editor) → errata E1.

---


---


# MEGA-PROMPT: REFACTOR "COVE NOTES" KE RUBRIC 10/10

Anda adalah AI coding agent yang akan merefactor kodebase "Cove Notes" (aplikasi desktop Tauri 2) hingga mencapai skor 10/10 pada seluruh dimensi rubric (Maintainability, Reliability, Reusability, Scalability, Performance, Testability, DRY, YAGNI, KISS, SRP, DIP, Separation of Concerns, Fail Fast, Clean Architecture). Eksekusi FASE berurutan. Baca ulang file yang disebut di tiap fase sebelum mengubah (semua path relatif terhadap `D:\remote\cove`). Bahasa instruksi: Bahasa Indonesia. Kode/identifier/teknis: English.

---

## PREAMBLE — KONTEKS PROYEK & ATURAN GLOBAL

**Stack:** React 18 + TypeScript + Vite 6 + Tailwind + Zustand + BlockNote + SQLite (`@tauri-apps/plugin-sql`) + AES-GCM (EncryptionService, per-device key di localStorage). Working dir `D:\remote\cove`. Package manager: **bun**. Linter: **Biome** (saat ini 0 error). `tsc --noEmit` pass. Git sudah init.

**Kondisi awal yang TERKONFIRMASI (verifikasi mandiri sebelum mulai):**
- `src/store/useNoteStore.ts:5` `const noteRepository = new SQLiteNoteRepository();` — repo dibangun di module-top (DIP FAIL). Store mencampur 3 tanggung jawab: shape state React + aturan bisnis (`duplicateNote` `useNoteStore.ts:140`, default literal `useNoteStore.ts:71-82`) + persistence orchestration (optimistic + rollback `useNoteStore.ts:105-118`). `isLoading` (`useNoteStore.ts:11,49`) ditulis TAPI tidak pernah dibaca komponen manapun.
- `src/store/useWorkspaceStore.ts:6` module-top repo; `useWorkspaceStore.ts:4` import `useNoteStore`; cross-store calls di baris 57, 74, 101, 130 (`useNoteStore.getState().fetchNotes/deleteNotesByWorkspace`). `deleteWorkspace` guard "cannot delete last workspace" di `useWorkspaceStore.ts:122-123` (`if (current.length <= 1) return;`).
- `src/repositories/SQLiteNoteRepository.ts` — row→Note mapping diduplikasi 4× (L51-64, L80-92, L108-120, L139-151). Semua read swallow error → `return []`/`null` (L66-69, L93-96, L122-125, L152-155). `getNotesMetadataByWorkspace` (L72-97) ADA (metadata-only, no decrypt) tetapi TIDAK pernah dipanggil; `fetchNotes` memakai `getNotesByWorkspace` (decrypt-all) `useNoteStore.ts:57`. `updateNote` (L201-296) read-modify-write + re-encrypt seluruh content meski hanya metadata berubah. Setiap mutasi dibungkus manual `BEGIN/COMMIT` di sekitar statement tunggal (3 IPC round-trip, L170/189, L212/228, L240/274, L301/303). `searchNotes` (L313-319) load+decrypt semua lalu JS filter — dead code.
- `src/repositories/INoteRepository.ts` — interface ada (L3-12) termasuk `getAllNotes`, `getNotesMetadataByWorkspace`, `searchNotes`. `IWorkspaceRepository` analog.
- `src/services/EncryptionService.ts` — FAIL OPEN di 3 titik: L71-73 (`startsWith("["/"<")` return apa adanya), L77 (`length < 13` return ciphertext), L90-93 (catch return `encryptedBase64`). Static class, key dari `localStorage.getItem("cove_device_sec_key")` (L7-14).
- `folderId` (dead schema): kolom `folderId TEXT` di `SQLiteNoteRepository.ts:23`; muncul di SELECT/INSERT/UPDATE/mapper (L55, L76, L83, L111, L142, L173, L178, L214, L217); `src/types/index.ts:10` `folderId?: string`; interface `Folder` di `src/types/index.ts`. **Tidak ada tabel `folders`, tidak ada FK, tidak ada UI folder.**
- Literal duplikat: `COVER_COLORS = ["#ff6f1e", ...]` identik di `src/components/editor/EditorHeader.tsx:20` dan `src/components/modals/CreateWorkspaceModal.tsx:10`. `#ff6f1e` default di banyak tempat. Default content `'[{\"type\":\"paragraph\",\"content\":[]}]'` di `useNoteStore.ts:72` dan `NoteList.tsx:29`.
- `tsconfig.json` SUDAH punya `target: ES2022`, `strict: true`, `noUnusedLocals/Parameters: true`, `noFallthroughCasesInSwitch: true`. Belum ada `noUncheckedIndexedAccess`.
- `biome.json` SUDAH punya `suspicious/noExplicitAny: error`, `a11y/useSemanticElements: error`, `a11y/useButtonType: error`, `correctness/useExhaustiveDependencies: error`, `style/useImportType: error`. Belum ada `suspicious/noConsole`.
- `src-tauri/tauri.conf.json:25` CSP **tidak null** (sudah strict) tetapi: tidak ada `object-src 'none'`/`media-src`/`worker-src`, `connect-src` tidak cantumkan `tauri://localhost`/`asset://localhost` (Tauri 2 custom protocols). Window (L13-23) tidak punya `"label": "main"` padahal `src-tauri/capabilities/default.json` mereferensikan `"windows": ["main"]` → capability mismatch (bug laten). `beforeDevCommand: "npm run dev"` (L7) — proyek pakai **bun**.
- `src-tauri/src/main.rs` (~8 baris) `.expect("error while running tauri application")` — panic tanpa hook, tanpa tracing.
- Bundle ~12 MB; main chunk 1.7 MB; BlockNote code-block highlighter menarik semua grammar bahasa.
- **Zero tests** (tidak ada vitest/testing-library di devDependencies).

### ATURAN GLOBAL (WAJIB, TIDAK ADA PENGECUALIAN)

1. **Setelah SETIAP fase selesai** jalankan KEDUA perintah dan keduanya harus PASS sebelum commit lanjut:
   - `bunx tsc --noEmit` → **0 error**
   - `bun run check` (= `biome check ./src`) → **0 error**
   Jika gagal: perbaiki kode, JANGAN pakai `@ts-ignore`/`biome-ignore` kecuali aturan fase mengizinkan eksplisit.
2. **Commit setelah setiap fase** dengan pesan `refactor(phase-N): <nama fase>`. Satu commit per fase.
3. **Jangan mengubah behavior yang user-visible** kecuali fase secara eksplisit mengharuskan (mis. menambah toast error, save-status badge — itu enhancement yang disengaja).
4. **Prefer memperbaiki kode** daripada menambah suppress directive.
5. **Editor tetap BlockNote.** Package manager tetap **bun**.
6. **Fail-Fast prinsip berlaku menyeluruh:** error database/decrypt/kegagalan aturan HARUS dilempar (throw) bertipe, BUKAN ditelan `return []/null` atau `return encryptedBase64`. Pemetaan ke UI (toast/save-status) di lapisan presentation.
7. Setelah membaca file dengan `Read`, gunakan `Edit` untuk modifikasi parsial; `Write` hanya untuk file baru atau replace-total yang eksplisit diinstruksikan.

---

## URUTAN FASE & ALASAN DEPENDENSI

Eksekusi urutan ini. Alasan: **FASE 1 (ARCH-DI)** mendefinisikan Domain/Application layer + injection yang menjadi target refactor semua fase berikut (store jadi thin, service menerima repo via constructor). **FASE 2 (REPO-HARDENING)** membutuhkan interface repo yang sudah distabilkan FASE 1 (mis. `deleteNotesByWorkspace`) sebelum menghapus duplikasi/transaction/fail-fast. **FASE 3 (ERROR-MODEL)** menyediakan kelas error bertipe + Result + Logger integration point yang dijadikan sumber throw oleh repo & service. **FASE 4 (YAGNI-CLEANUP)** menghapus `folderId`/dead method/konstanta terduplikasi; harus setelah FASE 1-3 agar mapper sudah tunggal (migrasi kolom menyentuh mapper). **FASE 5 (PERF-SCALE)** mengasumsikan mapper tunggal + metadata path + fail-fast sudah ada, lalu menambah pagination/virtualisasi/FTS/code-split. **FASE 6 (TESTABILITY)** menulis test di atas service+repo yang sudah injectable; coverage gate 70%. **FASE 7 (CONFIG-INFRA)** mengunci seluruh kemajuan via gate `verify` (tsc + biome + vitest + build), hardening CSP/Rust observability/Logger. Catatan: FASE 3 juga menyentuh repo yang sama dengan FASE 2 — bila overlap merusak, jalankan langkah fail-fast repo FASE 3 seketika setelah FASE 2 selesai (mereka konsisten: FASE 2 men-throw generik, FASE 3 mengganti jadi typed error).

---

# FASE 1 — ARCH-DI: Clean Architecture (Domain + Application + DI)

### OBJEKTIF
Perkenalkan **Domain layer** (`src/domain/**`, tanpa framework) dan **Application layer** (`src/services/**`, framework-agnostic, unit-testable). Service **memiliki** aturan bisnis + persistence orchestration dan **menerima** `INoteRepository`/`IWorkspaceRepository` via constructor. Store diturunkan menjadi **thin presentation-state cache**. Composition root `src/di/container.ts` menyatukan wiring. Ini memperbaiki: SRP, SoC, Clean Architecture, DIP (dua arah), Reusability, Testability, Maintainability.

### LANGKAH 1 — Domain layer

**1a. `src/domain/note/Note.ts`** — pindahkan interface `Note`. **Domain Note TIDAK boleh** mengandung `folderId` (dead field, dihapus permanen di FASE 4; di sini sudah bersih).
```ts
// src/domain/note/Note.ts
export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  coverColor?: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}
```
**`src/domain/workspace/Workspace.ts`** — pindahkan `Workspace` dari `src/types/index.ts`.
Update `src/types/index.ts` jadi barrel re-export (`export type { Note } from "../domain/note/Note";` dst.) agar import lama tidak putus selama transisi.

**1b. `src/domain/errors.ts`** — domain exceptions (menyediakan tipe throw; konsumsi konkrit di repo = FASE 3):
```ts
export class NotFoundError extends Error {
  constructor(public readonly entity: string, public readonly id: string) {
    super(`${entity} not found: ${id}`); this.name = "NotFoundError";
  }
}
export class BusinessRuleError extends Error {
  constructor(message: string) { super(message); this.name = "BusinessRuleError"; }
}
export class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message); this.name = "RepositoryError";
  }
}
```
(Catatan: FASE 3 akan memperkenalkan hirarki `AppError` yang lebih kaya — `NotFoundError`/`RepositoryError` di sini kompatibel atau diganti; pilih konsistensi saat FASE 3. Jika FASE 3 sudah dieksekusi sebelum FASE 1 secara konseptual, gunakan hirarki `AppError` dari FASE 3 sebagai gantinya.)

**1c. `src/domain/note/notePolicy.ts`** — policy murni (pure functions, mudah di-unit-test). Ekstrak literal terduplikasi + aturan terkubur:
```ts
import type { Note } from "./Note";
export const DEFAULT_NOTE_TITLE = "Untitled Note";
export const DEFAULT_NOTE_ICON = "📝";
export const DEFAULT_NOTE_COVER_COLOR = "#ff6f1e";
export const EMPTY_NOTE_CONTENT = '[{"type":"paragraph","content":[]}]';
export const makeNoteId = (): string => crypto.randomUUID();
export const duplicateNoteProps = (note: Pick<Note, "title" | "content" | "icon">) => ({
  title: `${note.title} (Copy)`, content: note.content, icon: note.icon,
});
export const canDeleteLastWorkspace = (count: number): boolean => count > 1;
```
(FASE 4 akan memindahkan `COVER_COLORS`/`DEFAULT_*` ke `src/constants/app.ts`; policy boleh re-export dari sana untuk satu sumber kebenaran.)

### LANGKAH 2 — Application layer

**2a. `src/services/INoteService.ts`** — service abstraction (DIP dari sisi store):
```ts
import type { Note } from "../domain/note/Note";
export interface INoteService {
  listMetadataByWorkspace(workspaceId: string): Promise<Note[]>; // metadata-only, NO decrypt
  getNote(id: string): Promise<Note | null>;
  createNote(workspaceId: string, title?: string, content?: string, icon?: string): Promise<Note>;
  updateMetadata(id: string, updates: Partial<Pick<Note, "title" | "icon" | "coverColor" | "isPinned" | "isFavorite" | "workspaceId">>): Promise<Note>;
  updateContent(id: string, content: string): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  duplicateNote(id: string): Promise<Note>;
  togglePin(id: string): Promise<Note>;
  toggleFavorite(id: string): Promise<Note>;
}
```
Pemisahan `updateMetadata` vs `updateContent` = prasyarat Performance (re-encrypt-on-metadata).

**2b. `src/services/NoteService.ts`** — menerima `INoteRepository` di constructor (BUKAN `new` module-top). Pindahkan SEMUA aturan bisnis dari store:
```ts
import type { Note } from "../domain/note/Note";
import { DEFAULT_NOTE_COVER_COLOR, DEFAULT_NOTE_ICON, DEFAULT_NOTE_TITLE,
  EMPTY_NOTE_CONTENT, duplicateNoteProps, makeNoteId } from "../domain/note/notePolicy";
import { NotFoundError } from "../domain/errors";
import type { INoteRepository } from "../repositories/INoteRepository";
import type { INoteService } from "./INoteService";

export class NoteService implements INoteService {
  constructor(private readonly notes: INoteRepository) {}

  async listMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    return this.notes.getNotesMetadataByWorkspace(workspaceId); // BUKAN decrypt-all
  }
  async getNote(id: string) { return this.notes.getNoteById(id); }
  async createNote(workspaceId, title = DEFAULT_NOTE_TITLE, content = EMPTY_NOTE_CONTENT, icon = DEFAULT_NOTE_ICON) {
    return this.notes.createNote({ id: makeNoteId(), workspaceId, title, content, icon,
      coverColor: DEFAULT_NOTE_COVER_COLOR, isPinned: false, isFavorite: false });
  }
  async updateMetadata(id, updates) { return this.notes.updateNote(id, updates); } // path metadata, no re-encrypt (FASE 2)
  async updateContent(id, content) { return this.notes.updateNote(id, { content }); } // path content, re-encrypt
  async duplicateNote(id) {
    const src = await this.notes.getNoteById(id);
    if (!src) throw new NotFoundError("Note", id);
    const { title, content, icon } = duplicateNoteProps(src);
    return this.createNote(src.workspaceId, title, content, icon);
  }
  async togglePin(id) { const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id); return this.notes.updateNote(id, { isPinned: !n.isPinned }); }
  async toggleFavorite(id) { const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id); return this.notes.updateNote(id, { isFavorite: !n.isFavorite }); }
  async deleteNote(id) { return this.notes.deleteNote(id); }
}
```

**2c. `src/services/IWorkspaceService.ts` + `src/services/WorkspaceService.ts`** — analog. `deleteWorkspace(id)` memeriksa `canDeleteLastWorkspace(...)` dan melempar `BusinessRuleError` bila gagal (Fail-Fast, bukan `return` diam). `WorkspaceService` menerima `IWorkspaceRepository` + `INoteRepository` agar cascade hapus note (`deleteNotesByWorkspace`) terjadi di level data, menghilangkan coupling antar-store.

> Tambahkan `deleteNotesByWorkspace(workspaceId: string): Promise<void>` ke `INoteRepository` (implementasi `DELETE FROM notes WHERE workspaceId = ?` di repo — kontrak dideklarasikan di sini, SQL konkret di FASE 2).

### LANGKAH 3 — Composition Root `src/di/container.ts`
Satu tempat eksplisit wiring. **Tidak boleh** ada `new SQLite*Repository()`/`new *Service()` di luar file ini (kecuali test).
```ts
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import { NoteService } from "../services/NoteService";
import { WorkspaceService } from "../services/WorkspaceService";
import type { INoteService } from "../services/INoteService";
import type { IWorkspaceService } from "../services/IWorkspaceService";

const noteRepository = new SQLiteNoteRepository();
const workspaceRepository = new SQLiteWorkspaceRepository();

export const noteService: INoteService = new NoteService(noteRepository);
export const workspaceService: IWorkspaceService = new WorkspaceService(workspaceRepository, noteRepository);
export const createNoteService = (repo: INoteRepository) => new NoteService(repo); // untuk test
```

### LANGKAH 4 — Store jadi thin presentation-state cache
Store tidak instantiate repo, tidak muat aturan bisnis, tidak cross-coupling. Optimistic UI + rollback **tetap di store** (presentation concern). Keputusan bisnis pindah ke service.

**Before** (`useNoteStore.ts:1-5`): `import { SQLiteNoteRepository } ...; const noteRepository = new ...;`
**After**: `import { noteService } from "../di/container";`

Mapping method:
- `fetchNotes` (`useNoteStore.ts:54-67`): `noteService.listMetadataByWorkspace(workspaceId)` (metadata only — sekalian perbaiki Scalability/decrypt-all). **Hapus `isLoading`** (YAGNI: tidak pernah dibaca).
- `createNote` (`:69-103`): optimistic tetap di store, input default dari service. Signature publik store dipertahankan.
- `updateNote` (`:105-118`): pecah kontekstual — title/icon/pin/favorite = `updateMetadata`; body editor = `updateContent`.
- `duplicateNote` (`:136-141`): `const created = await noteService.duplicateNote(id); set(...)`. Hapus aturan `duplicateNoteProps`.
- `togglePinNote`/`toggleFavoriteNote` (`:143-153`): delegasi ke service.
- `deleteNotesByWorkspace` (`:155-158`): **hapus dari store** — cascade ditangani `WorkspaceService`.

`useWorkspaceStore`: hapus `import { useNoteStore }` (`:4`) dan semua `useNoteStore.getState().*` (`:57, 74, 101, 130`). `setActiveWorkspace` hanya `set({ activeWorkspaceId })`; pemicu `fetchNotes` pindah ke `App.tsx` effect yang bereaksi `activeWorkspaceId`. `deleteWorkspace` guard pindah ke service; store tangkap `BusinessRuleError` untuk UX (toast).

### LANGKAH 5 — `src/main.tsx` import container sebagai side-effect
```tsx
import "./di/container"; // composition root — init sebelum React mount
```

### KENDALA
- DIP dua arah: store → `INoteService`/`IWorkspaceService`; service → `INoteRepository`/`IWorkspaceRepository`. Tidak ada import konkret menyeberang lapisan kecuali di container & test.
- Domain layer (`src/domain/**`) tanpa import Zustand/React/`@tauri-apps/*`/EncryptionService.
- Application layer (`src/services/*`) tanpa import React/Zustand.
- Fail-Fast: service melempar `NotFoundError`/`BusinessRuleError`/merelay repo error.
- Preserve behavior: signature publik store (`createNote`/`updateNote`/`deleteNote`) dipertahankan agar komponen tidak perlu refactor besar di fase ini.
- Method mati `searchNotes`/`getAllNotes` TIDAK dibawa ke `INoteService` (YAGNI).

### VERIFIKASI
- `bunx tsc --noEmit` → 0 error.
- `bun run check` → 0 error.
- `bunx vite build` → berhasil; tidak ada cyclic import `container ↔ store`.
- DIP guard (PowerShell, harus 0 match): `Select-String -Path "src/store/*.ts","src/components/**/*.tsx","src/services/*.ts" -Pattern 'new SQLite\w+Repository\(\)|new (Note|Workspace)Service\('`
- Domain purity guard (0 match): `Select-String -Path "src/domain/**/*.ts" -Pattern 'zustand|@tauri-apps|EncryptionService|from "react"'`
- Anti cross-store coupling (0 match): `Select-String -Path "src/store/*.ts" -Pattern 'useNoteStore\.getState|useWorkspaceStore\.getState'`

---

# FASE 2 — REPO-HARDENING: DRY + KISS + Dynamic UPDATE

### OBJEKTIF
(1) Ekstrak `mapRowToNote`/`mapRowToWorkspace` untuk runtuhkan duplikasi 4× (DRY). (2) Hapus `BEGIN/COMMIT` manual di sekitar statement tunggal (KISS + 3 IPC round-trip per mutasi). (3) Refactor `updateNote` jadi **dynamic UPDATE** yang hanya encrypt+menulis `content` saat `updates.content !== undefined` — hapus read-modify-write + re-encrypt-on-metadata (Performance). (4) Fail-fast: hapus `catch → return []/null` (detail throw di FASE 3).

### LANGKAH 1 — Helper `mapRowToNote` di `SQLiteNoteRepository.ts`
```ts
private async mapRowToNote(row: Record<string, unknown>, opts: { decrypt: boolean }): Promise<Note> {
  return {
    id: String(row.id), workspaceId: String(row.workspaceId),
    title: String(row.title),
    content: opts.decrypt
      ? await EncryptionService.decryptPayload(String(row.content ?? ""))
      : (row.content != null ? String(row.content) : ""),
    icon: row.icon ? String(row.icon) : undefined,
    coverColor: row.coverColor ? String(row.coverColor) : undefined,
    isPinned: Boolean(row.isPinned), isFavorite: Boolean(row.isFavorite),
    createdAt: Number(row.createdAt), updatedAt: Number(row.updatedAt),
  };
}
```
(Catatan: `folderId` dihapus dari mapper ini; lihat FASE 4 untuk migrasi kolom. Bila FASE 4 belum dijalankan, sertakan field `folderId` agar kompilasi tidak putus, lalu hapus saat FASE 4.)
Ganti 4 blok inline mapping (L51-64, L80-92, L108-120, L139-151) → `Promise.all(rows.map((row) => this.mapRowToNote(row, { decrypt: true/false })))`.

### LANGKAH 2 — `mapRowToWorkspace` di `SQLiteWorkspaceRepository.ts`
```ts
private mapRowToWorkspace(row: Record<string, unknown>): Workspace {
  return { id: String(row.id), name: String(row.name), emoji: String(row.emoji),
    color: String(row.color), description: row.description ? String(row.description) : undefined,
    createdAt: Number(row.createdAt) };
}
```
Ganti 2 inline mapping (L42-49, L67-74).

### LANGKAH 3 — Transaction helper di `SQLiteDatabase.ts`
```ts
static async withTransaction<T>(work: (db: Database) => Promise<T>): Promise<T> {
  const db = await SQLiteDatabase.getInstance();
  await db.execute("BEGIN TRANSACTION");
  try { const result = await work(db); await db.execute("COMMIT"); return result; }
  catch (err) { try { await db.execute("ROLLBACK"); } catch {} throw err; }
}
```
Pakai HANYA untuk multi-statement atomik. Single-statement: andalkan autocommit.

### LANGKAH 4 — Hapus `BEGIN/COMMIT` di statement tunggal
Di kedua repo: `initSchema`, `createNote`, `deleteNote`, `createWorkspace`, `updateWorkspace`, `deleteWorkspace`. Hapus `BEGIN TRANSACTION`/`COMMIT`/`ROLLBACK` di catch. Bentuk akhir `createNote`:
```ts
try {
  await db.execute(`INSERT INTO notes (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [note.id, note.workspaceId, note.title, encryptedContent, note.icon || null,
     note.coverColor || null, note.isPinned ? 1 : 0, note.isFavorite ? 1 : 0, note.createdAt, note.updatedAt]);
} catch (err) { console.error("SQLiteNoteRepository createNote error:", err); throw err; }
return note;
```

### LANGKAH 5 — Dynamic UPDATE (hapus read-modify-write + re-encrypt-on-metadata)
Ganti seluruh `updateNote` (L201-296):
```ts
async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const db = await this.getDb();
  const now = Date.now();
  const setClauses: string[] = []; const params: unknown[] = [];
  if (updates.workspaceId !== undefined) { setClauses.push("workspaceId = ?"); params.push(updates.workspaceId); }
  if (updates.title !== undefined) { setClauses.push("title = ?"); params.push(updates.title); }
  if (updates.content !== undefined) {
    const encrypted = await EncryptionService.encryptPayload(updates.content);
    setClauses.push("content = ?"); params.push(encrypted);
  }
  if (updates.icon !== undefined) { setClauses.push("icon = ?"); params.push(updates.icon || null); }
  if (updates.coverColor !== undefined) { setClauses.push("coverColor = ?"); params.push(updates.coverColor || null); }
  if (updates.isPinned !== undefined) { setClauses.push("isPinned = ?"); params.push(updates.isPinned ? 1 : 0); }
  if (updates.isFavorite !== undefined) { setClauses.push("isFavorite = ?"); params.push(updates.isFavorite ? 1 : 0); }
  setClauses.push("updatedAt = ?"); params.push(now); params.push(id);
  try { await db.execute(`UPDATE notes SET ${setClauses.join(", ")} WHERE id = ?`, params); }
  catch (err) { console.error("SQLiteNoteRepository updateNote error:", err); throw err; }
  const existing = await this.getNoteById(id);
  if (!existing) throw new Error(`Note not found after update: ${id}`);
  return existing;
}
```
Hasil: `togglePin`/edit title tidak lagi re-encrypt content.

### LANGKAH 6 — Fail-Fast pada read (hapus swallow)
Ganti `catch → return []/null`:
```ts
} catch (err) { console.error("SQLiteNoteRepository <method> error:", err); throw err; }
```
`getNoteById`/`getWorkspaceById`: `rows.length === 0` tetap `return null` (not-found valid), error DB → `throw`. (Kedua kasus harus dapat dibedakan pemanggil — ini prasyarat rubric Reliability.)

### LANGKAH 7 — YAGNI method mati
Hapus `searchNotes` (L313-319) + `getAllNotes` (L44-70) dari repo & interface — NAMUN bila FASE 1/PERF-SCALE mengimplementasikan ulang search via FTS, pertahankan kontrak yang baru. Sebelum hapus: grep `searchNotes`/`getAllNotes` di `src` pastikan 0 call site aktif. **Pertahankan dulu `getNotesByWorkspace`** sampai FASE 1/PERF-SCALE sepenuhnya memigrasi `fetchNotes` ke metadata path.

### KENDALA
- Jangan sentuh `EncryptionService` (FASE 3).
- Jangan ubah signature publik store dipakai kecuali sudah dikoordinasi FASE 1.
- `updateNote` throw bila note tidak ada setelah UPDATE; `getNoteById`/`getWorkspaceById` `null` untuk not-found tetapi `throw` untuk DB error.
- `console.error` generik di sini akan diganti `Logger.error` + typed throw di FASE 3 & FASE 7.

### VERIFIKASI
- `bun run check` → 0 error. `bunx tsc --noEmit` → 0 error.
- `Grep 'BEGIN TRANSACTION|COMMIT|ROLLBACK' src/repositories` → hanya di `SQLiteDatabase.withTransaction`.
- `Grep 'mapRowToNote|mapRowToWorkspace'` → masing-masing tepat 1 definisi + dipakai.
- `Grep 'getNoteById\(id\)'` di `updateNote` → tidak ada pemanggilan SEBELUM UPDATE (read-modify-write dihapus).
- Manual smoke: buat note → togglePin → cek DB → title & content tidak berubah (tidak re-encrypt), updatedAt terbarui.

---

# FASE 3 — ERROR-MODEL: Typed errors + Result + Fail Loud + save-status UI

### OBJEKTIF
Bangun hirarki error bertipe di `src/errors/`, helper `Result<T,E>`, hapus SEMUA error-swallowing repo (ganti `return []/null` jadi typed throw), ubah `EncryptionService` jadi FAIL LOUD, wiring UI via save-status badge + toast. Memperbaiki: Reliability, Fail Fast, Maintainability, SoC error→UI.

### LANGKAH 1 — `src/errors/AppError.ts` + sub-kelas + barrel
```ts
export type ErrorCategory = "not_found" | "validation" | "persistence" | "encryption" | "concurrency" | "unknown";
export interface AppErrorOptions { cause?: unknown; userFacing?: boolean; context?: Record<string, unknown>; }
export abstract class AppError extends Error {
  abstract readonly category: ErrorCategory;
  readonly userFacing: boolean;
  readonly context?: Record<string, unknown>;
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = this.constructor.name; this.userFacing = options.userFacing ?? true; this.context = options.context;
    if (typeof Error.captureStackTrace === "function") Error.captureStackTrace(this, this.constructor);
  }
  toJSON() { return { name: this.name, category: this.category, message: this.message, context: this.context }; }
}
```
Sub-kelas: `NotFoundError` (`category: "not_found"`), `ValidationError` (`"validation"`), `PersistenceError` (`"persistence"`), `EncryptionError` (`"encryption"`, field `reason: "key_unavailable"|"decrypt_failed"|"encrypt_failed"|"malformed_payload"`), `ConcurrencyError` (`"concurrency"`). Barrel `src/errors/index.ts`.
> Catatan rekonsiliasi FASE 1: jika `src/domain/errors.ts` sudah ada (`NotFoundError`/`BusinessRuleError`/`RepositoryError`), migrasi/menyatu ke `src/errors/` ini sebagai sumber tunggal. Domain layer boleh re-export dari `src/errors/` bila masih ingin domain-pure path; atau pindahkan domain exceptions ke `src/errors/` dan hapus `src/domain/errors.ts`. Pilih SATU dan konsisten.

### LANGKAH 2 — `src/errors/Result.ts`
```ts
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T) => ({ ok: true, value } as const);
export const err = <E>(error: E) => ({ ok: false, error } as const);
export const isOk = <T,E>(r: Result<T,E>): r is { ok: true; value: T } => r.ok;
export const isErr = <T,E>(r: Result<T,E>): r is { ok: false; error: E } => !r.ok;
```
`src/errors/errorMappers.ts`: `toPersistenceError(operation, cause)`, `toAppError(cause)` (type-guard unknown → AppError, tidak pernah swallow).
> Desain HYBRID: repo & service THROW `AppError` (komposabel dengan async/await eksisting). `Result` opsional untuk boundary yang ingin hindari try/catch. JANGAN migrasi seluruh API repo ke Result-only di fase ini.

### LANGKAH 3 — `EncryptionService` FAIL LOUD
Edit `src/services/EncryptionService.ts`. Hapus 3 titik fail-open (L71-73, L77, L90-93). `decryptPayload`:
```ts
static async decryptPayload(encryptedBase64: string): Promise<string> {
  if (!encryptedBase64) return "";
  let combined: Uint8Array;
  try { combined = EncryptionService.base64ToBytes(encryptedBase64); }
  catch (cause) { throw new EncryptionError("malformed_payload", "Note payload is not valid base64", { cause }); }
  if (combined.length < 13) throw new EncryptionError("malformed_payload", `Payload too short (${combined.length} bytes)`);
  const iv = combined.subarray(0, 12); const ciphertext = combined.subarray(12);
  let key: CryptoKey;
  try { key = await EncryptionService.getOrGenerateMasterKey(); }
  catch (cause) { throw new EncryptionError("key_unavailable", "Failed to obtain AES master key", { cause }); }
  try {
    const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(ciphertext));
    return new TextDecoder().decode(buf);
  } catch (cause) { throw new EncryptionError("decrypt_failed", "Could not decrypt note content (wrong key or corrupted)", { cause }); }
}
```
`encryptPayload` (L54-67): bungkus kegagalan `getOrGenerateMasterKey`/`subtle.encrypt` jadi `EncryptionError`. Legacy plain-text detection (`startsWith("[")`) TIDAK boleh return apa adanya — pindahkan kebijakan ke repo (catatan). Untuk fase ini: FAIL LOUD.

### LANGKAH 4 — Repo reads: stop swallow, throw typed
Ganti `catch → return []/null` jadi `throw toPersistenceError("<method>", cause)`. `getNoteById`: `rows.length === 0` → `throw new NotFoundError("Note", id)` (atau `return null` bila kontrak eksplisit menyatakan null=not-found; di sini pilih throw untuk fail-fast konsisten). `initSchema` throw `PersistenceError` (jangan swallow — bootstrap tahu schema gagal). `updateNote` L207 `throw new Error("Note not found")` → `NotFoundError`. `createNote`/`deleteNote` dll: `throw err` generik → `throw toPersistenceError(...)`. Identik di `SQLiteWorkspaceRepository`.

### LANGKAH 5 — Toast mechanism
`src/store/useNotificationStore.ts` (Zustand): `toasts`, `pushToast({kind,title,description,durationMs})`, `dismissToast`. `src/components/ToastContainer.tsx` (framer-motion enter/exit, lucide icons, Tailwind sesuai ErrorBoundary). Mount di `src/App.tsx` dalam `<ErrorBoundary>`.

### LANGKAH 6 — save-status + error→UI mapping terpusat (SRP)
`src/store/useSaveStatusStore.ts`: `status: "idle"|"saving"|"saved"|"error"`, `lastSavedAt`, `errorMessage`. `src/services/errorPresenter.ts` — `presentError(e): {toastTitle, toastDescription, userMessage, kind}` switch atas `appErr.category` (exhaustive). Wiring di `useNoteStore.updateNote` (ganti `isLoading`):
```ts
updateNote: async (id, updates) => {
  const previousNotes = get().notes;
  set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)) }));
  useSaveStatusStore.getState().setSaving();
  try { await noteService.updateMetadata(id, updates); useSaveStatusStore.getState().setSaved(); }
  catch (e) { set({ notes: previousNotes });
    const p = presentError(e);
    useSaveStatusStore.getState().setError(p.userMessage);
    useNotificationStore.getState().pushToast({ kind: p.kind, title: p.toastTitle, description: p.toastDescription, durationMs: 5000 }); }
}
```
Pola sama untuk `createNote`/`deleteNote`/`duplicateNote`/`togglePin`/`toggleFavorite`. `fetchNotes`: error → toast "Could not load notes" + pertahankan list lama (jangan kosongkan). `SaveStatusBadge.tsx` dipasang di `EditorHeader.tsx` (baris "X words • ...") .

### LANGKAH 7 — Hapus `console.error` per-method (single point)
Hapus `console.error("...store error...", err)` duplikat (`useNoteStore.ts:64,99,115,131`; `useWorkspaceStore.ts:77,104,117,135`). Ganti dengan logger terpusat dari FASE 7 (`Logger.error`) bila sudah ada, atau biarkan throw + `presentError` (FASE 7 akan menyelesaikan migrasi console→Logger).

### KENDALA
- JANGAN pernah return plaintext saat encrypt gagal / ciphertext saat decrypt gagal (prinsip paling keras).
- JANGAN pernah `return []/null` dari repo saat exception. `[]`/`null` valid HANYA saat query sukses & kosong.
- `AppError` tetap extends `Error` (stack trace + `instanceof Error` di ErrorBoundary bekerja).
- Tidak tambah dependency runtime baru.

### VERIFIKASI
- `bun run check` & `bunx tsc --noEmit` → 0 error.
- `bun run build` sukses; tidak ada circular import `errors/index.ts`.
- Grep anti-regression:
  - `rg -n "return \[\]" src/repositories/SQLiteNoteRepository.ts src/repositories/SQLiteWorkspaceRepository.ts` → hanya happy-path rows kosong, BUKAN di catch.
  - `rg -n "return encryptedBase64" src/services/EncryptionService.ts` → 0.
  - `rg -n "return null" src/repositories/SQLiteNoteRepository.ts` → 0 (ganti NotFoundError) atau hanya not-found happy-path bila kontrak null.
  - `rg -n "console.error" src/store/useNoteStore.ts src/store/useWorkspaceStore.ts` → 0.
- Manual: buat note → badge "Saving…"→"Saved"; rename `cove.db` lalu edit → toast "Save failed", list tidak kosong, rollback; corrupt satu baris content → toast "Content could not be decrypted", content tidak ditampilkan sebagai ciphertext mentah.

---

# FASE 4 — YAGNI-CLEANUP: hapus dead code, folderId, centralize konstanta

### OBJEKTIF
Hapus `folderId` (dead schema, no FK/UI/Folders table), hapus method repo mati, konsumsi/hapus `isLoading` (sudah dihapus FASE 1 — verifikasi), sentralkan literal duplikat ke `src/constants/`.

### LANGKAH 1 — Hapus folderId (recreate-table migration, SQLite < 3.35 safe)
`src/types/index.ts`: hapus `folderId?: string` dari `Note`; hapus interface `Folder`.
`SQLiteNoteRepository.ts`: hapus `folderId TEXT` (L23), hapus dari SELECT (L76), INSERT (L173-178), UPDATE (L214/217), mapper. Tambahkan migration runner di `initSchema`:
```ts
const version = (await db.select<{user_version:number}[]>("PRAGMA user_version"))[0]?.user_version ?? 0;
if (version < 2) {
  const cols = await db.select<{name:string}[]>("PRAGMA table_info(notes)");
  if (cols.some((c) => c.name === "folderId")) {
    await SQLiteDatabase.withTransaction(async (db) => {
      await db.execute(`CREATE TABLE notes_new (id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, icon TEXT, coverColor TEXT, isPinned INTEGER NOT NULL DEFAULT 0, isFavorite INTEGER NOT NULL DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE)`);
      await db.execute(`INSERT INTO notes_new (id,workspaceId,title,content,icon,coverColor,isPinned,isFavorite,createdAt,updatedAt) SELECT id,workspaceId,title,content,icon,coverColor,isPinned,isFavorite,createdAt,updatedAt FROM notes`);
      await db.execute("DROP TABLE notes");
      await db.execute("ALTER TABLE notes_new RENAME TO notes");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_workspaceId ON notes(workspaceId)");
      await db.execute("PRAGMA user_version = 2");
    });
  } else { await db.execute("PRAGMA user_version = 2"); }
}
```

### LANGKAH 2 — Hapus method mati & wire metadata path
Hapus `getAllNotes` + `searchNotes` dari repo & `INoteRepository` (grep pastikan 0 call site aktif). `fetchNotes` sudah dialihkan ke `getNotesMetadataByWorkspace` di FASE 1 — verifikasi. Bila tak ada konsumen `getNotesByWorkspace` lain, hapus juga (sisakan `getNotesMetadataByWorkspace` untuk list + `getNoteById` untuk buka note penuh).
> Pastikan `loadActiveNoteContent(id)` (atau setara) ada agar `content:""` dari metadata TIDAK mengalir ke BlockNoteEditor — konten penuh di-load via `getNoteById` saat `activeNoteId` berubah (dikoordinasi PERF-SCALE Langkah 1).

### LANGKAH 3 — `isLoading`
Sudah dihapus di FASE 1. Verifikasi `Grep 'isLoading' src` → 0 (kecuali bila memilih opsi konsumsi skeleton di NoteList — pilih SATU).

### LANGKAH 4 — `src/constants/app.ts`
```ts
export const COVER_COLORS = ["#ff6f1e","#a594f9","#ff70a6","#ff9770","#ffd670","#70d6ff","#b8f2e6"] as const;
export const DEFAULT_COVER_COLOR = "#ff6f1e";
export const DEFAULT_ACCENT_COLOR = DEFAULT_COVER_COLOR; // alias semantik workspace
export const DEFAULT_NOTE_ICON = "📝";
export const DEFAULT_NOTE_TITLE = "Untitled Note";
export const DEFAULT_NOTE_CONTENT = '[{"type":"paragraph","content":[]}]';
export const DEFAULT_WELCOME_NOTE_CONTENT = '[{"type":"paragraph","content":[{"type":"text","text":"Welcome to your brand new block editor in Cove Notes!"}]}]';
export const APP_LOCALE = "en-US";
```
Sinkronkan `src/domain/note/notePolicy.ts` re-export dari sini. Ganti semua duplikat: `EditorHeader.tsx:20,62,72(x2),143`; `CreateWorkspaceModal.tsx:10,17,26,118`; `WorkspaceSwitcher.tsx:24`; `useNoteStore.ts:35,37,71-73,82`; `useWorkspaceStore.ts:34`; `NoteList.tsx:29,30`. Pertahankan `src/constants/messages.ts` (sudah sentral); pastikan `DEFAULT_NOTE_TITLE` dan `MESSAGES.UNTITLED_NOTE` tidak kontradiksi.

### KENDALA
- Setiap hapus kolom/field WAJIB disertai migrasi `PRAGMA user_version` (recreate-table).
- Setelah hapus method, `INoteRepository` konsisten dengan impl.
- Biome 0, tsc 0.

### VERIFIKASI
- `bunx biome check` & `bunx tsc --noEmit` → 0 error.
- `Select-String -Pattern 'folderId|Folder|searchNotes|getAllNotes' -Path src -SimpleMatch` → 0 (di luar komentar).
- `Select-String -Pattern '#ff6f1e' -Path src` → hanya di `src/constants/app.ts` (+ `index.css`/`tailwind.config.js` bila token CSS).
- Manual: DB lama dengan folderId → migrasi berjalan, catatan lama tampil.

---

# FASE 5 — PERF-SCALE: metadata path, pagination, virtualisasi, FTS, bundle < 5 MB

### OBJEKTIF
Hilangkan decrypt-all-on-list, tambah keyset pagination + virtualisasi, memoisasi React, push search ke SQL (FTS5), tuning SQLite, potong bundle 12 MB → < 5 MB. Mengasumsikan mapper tunggal (FASE 2) + metadata path (FASE 1/4) + fail-fast (FASE 3) sudah ada.

### LANGKAH 1 — Lazy content decrypt
`fetchNotes` → `getNotesMetadataByWorkspace` (sudah). Tambah `getNoteContent(id)` di `INoteRepository` + impl (SELECT content WHERE id, decrypt 1 baris). Action store `loadActiveNoteContent(id)`. Di `App.tsx` effect: saat `activeNoteId` berubah & note.content === "", picu load. Hapus `getNotesByWorkspace`/`getAllNotes` bila 0 call site.

### LANGKAH 2 — Keyset pagination
Signature `getNotesMetadataByWorkspace(workspaceId, cursor?: {updatedAt; id} | null, limit = 50)`. Query `ORDER BY updatedAt DESC, id DESC LIMIT ?` + cursor `WHERE (updatedAt < ? OR (updatedAt = ? AND id < ?))`. State store `cursor` + `fetchMoreNotes(workspaceId)`. Indeks komposit wajib (Langkah 6).

### LANGKAH 3 — Virtualisasi (`@tanstack/react-virtual`)
`bun add @tanstack/react-virtual`. `NoteList.tsx`: gabung 3 section jadi array virtual `[header, ...pinned, header, ...favorites, header, ...other]`, virtualizer tunggal `estimateSize: () => 48, overscan: 8`. Ganti `AnimatePresence.map` (L135-137, L147-148, L160-162) → enter-only animation. `QuickSearchModal.tsx`: setelah search SQL, `shouldFilter={false}` pada `<Command>`, virtualisasi bila > 100 hasil.

### LANGKAH 4 — Memoisasi
Ekstrak `NoteItem` (`NoteList.tsx:34-95`) → `src/components/sidebar/NoteItem.tsx` + `React.memo`. Callback stabil via `useCallback`. `useShallow` selectors dari `zustand/react/shallow` (ganti `useNoteStore()` tanpa selector di `NoteList.tsx:10-18`, `App.tsx:15`, `QuickSearchModal.tsx:44`). `useMemo` partitions pinned/favorite/other. `src/utils/plainText.ts` — `getPlainText(note)` dengan cache `WeakMap<Note,string>` atau `plainTextById` (dipakai FTS feed + word-count editor).

### LANGKAH 5 — Search SQL FTS5
Schema (di `initSchema`): `CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(title, plainText, tokenize='unicode61 remove_diacritics 2')` + trigger sinkron INSERT/UPDATE/DELETE. **Tambah kolom `plainText` (plaintext) ke `notes`** untuk search isi. **DOKUMENTASIKAN trade-off**: ini mengurangi encryption-at-rest untuk kolom tersebut (pilih eksplisit; bila hard requirement enkripsi-at-rest, FTS atas `title` saja). Re-implement `searchNotes(query, workspaceId?, limit=50)`:
```sql
SELECT n.id, n.workspaceId, n.title, n.icon, n.coverColor, n.isPinned, n.isFavorite, n.createdAt, n.updatedAt
FROM notes_fts f JOIN notes n ON n.id = f.rowid
WHERE notes_fts MATCH ? AND (? IS NULL OR n.workspaceId = ?)
ORDER BY rank LIMIT ?;
```
Return metadata-only. Sa `createNote`/`updateNote` (content baru): hitung `plainText = getPlainText(content)`, tulis kolom + UPSERT FTS. `QuickSearchModal`: `shouldFilter={false}`, debounced input → store `runSearch(query)`.

### LANGKAH 6 — Tuning SQLite
`SQLiteDatabase.ts` setelah WAL/synchronous/foreign_keys: `PRAGMA temp_store = MEMORY`, `cache_size = -20000`, `mmap_size = 268435456`, `wal_autocheckpoint = 1000`. Indeks di `initSchema`: ganti `idx_notes_workspaceId` → `idx_notes_workspace_updated ON notes(workspaceId, updatedAt DESC, id DESC)` (wajib untuk keyset).

### LANGKAH 7 — Bundle < 5 MB
Lazy-load BlockNote highlighter (`src/editor/highlighter.ts`, kurasi `[javascript,typescript,python,json,bash,sql,markdown,css,html,rust]`, dynamic import). Code-split `emoji-picker-react` (`EditorHeader.tsx:2`, `React.lazy`) + `QuickSearchModal` + `CreateWorkspaceModal`. Perbaiki `manualChunks` (`vite.config.ts:19-34`): `vendor-react`, `vendor-ui`, `vendor-blocknote`, `vendor-highlighter` (dynamic), `vendor-emoji` (dynamic), `vendor-motion`, `vendor-icons`. `build.target: 'esnext'`. Target: initial main+vendor < 1 MB, total gzip < 2 MB, total < 5 MB.

### KENDALA
- Asumsi `mapRowToMetadata`/`mapRowToFull` (FASE 2) sudah ada.
- Tidak tambah try/catch swallow (konsisten FASE 3).
- Jika FASE 4 menghapus `folderId`, hapus klausa `folderId IS NULL` dari query pagination.
- `EditorHeader.tsx:41-52` title SUDAH debounce 300ms (OK) — ekstrak helper `src/utils/debounce.ts` bersama body editor.
- Trade-off FTS vs enkripsi: tandai eksplisit di kode & CLAUDE.md.

### VERIFIKASI
- `bun run build` → bandingkan ukuran vs baseline 12 MB; buka `stats.html`; `vendor-highlighter` & `vendor-emoji` = dynamic chunks.
- `Grep 'getNotesByWorkspace|getAllNotes' src` → 0 call site aktif.
- `console.time` sekitar metadata method → tidak ada `decryptPayload` di list path.
- `EXPLAIN QUERY PLAN` query pagination → pakai `idx_notes_workspace_updated` (bukan scan).
- PRAGMA check: `wal`/`1`/`-20000`.
- `SELECT * FROM notes_fts WHERE notes_fts MATCH 'test*'` → hasil.
- React DevTools Profiler: 1000 catatan dummy → hanya ~15-20 `NoteItem` mount; edit title satu note → hanya NoteItem bersangkutan re-render.
- `bunx tsc --noEmit` & `bun run check` → 0 error. Alur inti (create/edit/pin/favorite/delete/search) tetap berfungsi.

---

# FASE 6 — TESTABILITY: vitest + coverage gate 70%

### OBJEKTIF
Dari 0 test → coverage gate 70% pada `src/services`, `src/repositories`, `src/errors`. BERGANTUNG FASE 1 (service injectable) + FASE 3 (fail-loud, error bertipe) + FASE 2 (mapper tunggal).

### LANGKAH 1 — Install
`bun add -d vitest@^2 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14 jsdom@^25 @vitest/coverage-v8@^2`

### LANGKAH 2 — `vitest.config.ts` (terpisah dari `vite.config.ts`)
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"], exclude: ["node_modules","src-tauri","dist"],
    coverage: { provider: "v8", reporter: ["text","html","lcov"],
      include: ["src/services/**","src/repositories/**","src/errors/**"],
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 } } },
});
```
`src/test/setup.ts`: `import "@testing-library/jest-dom/vitest"; afterEach(() => { cleanup(); localStorage.clear(); })`. Tambah `types: ["vitest/globals","@testing-library/jest-dom"]` ke `tsconfig.json`.

### LANGKAH 3 — Scripts `package.json`
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ci": "vitest run --coverage",
```

### LANGKAH 4 — In-memory fake repos
`src/test/fakes/InMemoryNoteRepository.ts` (implement `INoteRepository` penuh, `Map` + `FailureConfig` inject error + `getCallLog()`). `InMemoryWorkspaceRepository.ts` analog. **JANGAN** pakai `vi.fn()` stub per-method untuk seluruh interface (kehilangan type-safety); implement penuh.

### LANGKAH 5 — Service tests
`src/services/NoteService.test.ts`:
- `duplicateNote` menyalin content+icon, judul `(Copy)` (assert `getCallLog()` contains `createNote`).
- `togglePin` membalik flag.
- `listMetadataByWorkspace` memanggil `getNotesMetadataByWorkspace` BUKAN `getNotesByWorkspace` (assert call log eksak).
- repo throw → service throw (fail-fast), BUKAN swallow `null`.
- `duplicateNote` id tidak ditemukan → `NotFoundError`.

`WorkspaceService.test.ts`:
- `deleteWorkspace` workspace terakhir → `BusinessRuleError` (atau nama error aktual dari FASE 1/3 — samakan).

### LANGKAH 6 — `EncryptionService.test.ts`
Round-trip UTF-8 multibyte; ciphertext unik antar encrypt (IV acak); decrypt key salah → `EncryptionError` (BUKAN return ciphertext); input < 13 byte → `EncryptionError`. (Bila FASE 1/3 menjadikan EncryptionService instance/parameterizable, pakai 2 key berbeda; bila static, adapter instance di test — tetap assert throw.)

### LANGKAH 7 — `noteMappers.test.ts`
`mapRowToNote` konversi integer 0/1 → boolean, `null` → `undefined`. `mapRowToNoteMetadata` kosongkan content & tidak panggil decrypt.

### KENDALA
- JANGAN import `@tauri-apps/plugin-sql`/`SQLiteDatabase.getInstance()` di file yang ikut test environment.
- `cleanup()` + `localStorage.clear()` di afterEach (EncryptionService lama baca localStorage).
- Samakan nama method/error ke aktual hasil FASE 1/3.

### VERIFIKASI
- `bun run test` → semua spec lulus, exit 0.
- `bun run test:ci` → coverage `src/services`+`src/repositories`+`src/errors` ≥ 70% (lines/fns/branches/stmts); CI gagal bila di bawah.
- `bun run check` & `bunx tsc --noEmit` → 0 (termasuk `src/test/**`).
- `bun run build` tidak terpengaruh (test excluded).

---

# FASE 7 — CONFIG-INFRA: kunci gate, CSP, Rust observability, Logger

### OBJEKTIF
Hardening config + observability + gate otomatis `verify` yang mengunci seluruh kemajuan. Fail-fast konsisten, single-sink Logger.

### LANGKAH 1 — `tsconfig.json`
Verifikasi field ada. Tambahkan (jika belum) setelah `noFallthroughCasesInSwitch`:
```jsonc
"noUncheckedIndexedAccess": true,
"forceConsistentCasingInFileNames": true,
```
Perbaiki SEMUA error baru (`arr[0]`/`obj[key]` tanpa null-check) dengan guard/optional chaining — JANGAN `!` tanpa justifikasi. Titik rawan: row-mapper repo, `EncryptionService` `matched.map`, `base64ToBytes` loop.

### LANGKAH 2 — `biome.json` `noConsole`
Tambahkan `"noConsole": "error"` di blok `suspicious`. Ganti SEMUA `console.*` (`useWorkspaceStore.ts:77,104,117,135`; `EncryptionService.ts:91`; `SQLiteWorkspaceRepository.ts:31,51,76,104,132,149`; `useNoteStore.ts:64,99,115,131`; `SQLiteNoteRepository.ts:40,67,94,123,153,191,231,290,305`; `ErrorBoundary.tsx:25`; `BlockNoteEditor.tsx:104,114,119`; `QuickSearchModal.tsx:36`) → `Logger.error/info/warn`. `console.error("X", err)` → `Logger.error("X", err)`. **DILARANG `// biome-ignore lint/suspicious/noConsole`** kecuali tepat 1 baris di `src/services/Logger.ts` (`"Logger is the single console sink"`).

### LANGKAH 3 — `tauri.conf.json`
(a) Window: tambah `"label": "main"` (match capability `default.json`).
(b) CSP hardened (ganti L25):
```
"csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self'; object-src 'none'; worker-src 'self' blob:; frame-src 'none'; child-src 'none'; connect-src 'self' ipc: http://ipc.localhost tauri://localhost asset://localhost"
```
(`style-src 'unsafe-inline'` tetap untuk Tailwind/BlockNote; `script-src` tanpa `'unsafe-inline'`/`'unsafe-eval'`.)
(c) `"beforeDevCommand": "bun run dev"`, `"beforeBuildCommand": "bun run build"` (ganti npm).

### LANGKAH 4 — `src/services/Logger.ts`
Single typed sink, level via `VITE_LOG_LEVEL`, `serializeError`, `biome-ignore` 1× di `emit`:
```ts
export type LogLevel = "debug" | "info" | "warn" | "error";
// ... emit() dengan // biome-ignore lint/suspicious/noConsole: Logger is the single console sink
export const Logger = { debug, info, warn(message, error?, context?), error(message, error?, context?) } as const;
```
Migrasi: `console.error("X", err)` → `Logger.error("X error", err, {...})`; `ErrorBoundary.tsx:25` → `Logger.error("Uncaught Error Boundary catch", error, { componentStack })`.

### LANGKAH 5 — Rust observability (`Cargo.toml` + `src-tauri/src/main.rs`)
Cargo: `log`, `tracing`, `tracing-subscriber = { version = "0.3", features = ["env-filter"] }`. main.rs: `init_logging()` (EnvFilter, debug=info/release=warn), `install_panic_hook()` (`tracing::error!` + backtrace + default_hook), `.run(...).unwrap_or_else(|e| { tracing::error!(error=%e, "fatal"); std::process::exit(1); })` (ganti `.expect`).

### LANGKAH 6 — `vite.config.ts`
```ts
server: { port: 1420, strictPort: true, host: "127.0.0.1" },
```
(match `devUrl: "http://localhost:1420"`). `chunkSizeWarningLimit: 800` tetap; setelah FASE 5 pastikan tidak ada chunk > 800 kB.

### LANGKAH 7 — Error policy
`Logger.error` = observability SAJA. Setelah log, error HARUS throw ke caller (UI/ErrorBoundary). DILARANG: `catch (err) { Logger.error(...); return []; }`. BENAR: `catch (err) { Logger.error("...", err); throw toPersistenceError("...", err); }`.

### LANGKAH 8 — Master verify script (`package.json`)
```jsonc
"typecheck": "tsc --noEmit",
"lint": "biome check ./src",
"lint:fix": "biome check --write ./src",
"verify": "bun run typecheck && bun run lint && bun run test && bun run build"
```

### VERIFIKASI
- `bun run typecheck` → 0 (termasuk `noUncheckedIndexedAccess`).
- `bun run lint` → 0 error/warning. `rg -n "biome-ignore" src` → hanya `src/services/Logger.ts`.
- `rg -n "console\.(error|log|warn)" src` → hanya di `src/services/Logger.ts`.
- `cd src-tauri && cargo build --release` → 0 error; `cargo clippy -- -D warnings` → 0 bila terpasang.
- `bunx tauri build` → `src-tauri/target/release/bundle/nsis/Cove Notes_*_x64-setup.exe`; DevTools bersih CSP/console.error.
- `bun run build` → buka `stats.html`: tidak ada chunk > 800 kB, total < 12 MB.
- `bunx tauri dev` → window terbuka, no CSP error.
- `bun run verify` → semua exit 0.

---

## CROSS-CUTTING CONSTRAINTS (berlaku semua fase)

- **Bahasa**: instruksi Indonesian; kode/identifier English.
- **Path absolut** saat memanggil tools (`D:\remote\cove\...`).
- **Jangan tulis file `.md` laporan/ringkasan** — semua perubahan langsung ke kode sumber.
- **Rollback tetap di store** (presentation concern); keputusan bisnis di service; persistence detail di repo.
- **Mapper tunggal** (`mapRowToNote`/`mapRowToWorkspace` atau `mapRowToMetadata`/`mapRowToFull`) — sumber kebenaran tunggal, dipakai semua call site.
- **Konstanta tunggal** di `src/constants/app.ts`; policy di `src/domain/note/notePolicy.ts` re-export.
- **Tidak ada `new` konkret class menyeberang lapisan** kecuali di `src/di/container.ts` & test.
- **Fail-fast menyeluruh**: throw typed `AppError`; UI mapping via `presentError` + toast + save-status.
- **BlockNote tetap editor; bun tetap PM.**

---

## MASTER VERIFICATION CHECKLIST (mapping rubric → fase)

| Rubric item | Diperbaiki di | Bukti akhir |
|---|---|---|
| **Maintainability** (rules out of store; row mapping x4; dead folderId) | FASE 1 (service owns rules) + FASE 2 (mapper tunggal) + FASE 4 (hapus folderId) | `Select-String 'useNoteStore\.getState' src/store` = 0; mapper = 1 definisi; `folderId` = 0 |
| **Reliability** (swallow → []/null; CSP; EncryptionService fail-open) | FASE 3 (typed throw + fail-loud) + FASE 7 (CSP hardened) | `rg "return \[\]|return null|return encryptedBase64" src/repositories src/services/EncryptionService.ts` = 0 di catch; CSP include `tauri://localhost`; DevTools bersih |
| **Reusability** (mapper not extracted; literals duplicated) | FASE 2 + FASE 4 (`src/constants/app.ts`) | `rg '#ff6f1e|COVER_COLORS' src` hanya di constants; mapper 1× |
| **Scalability** (decrypt-all-on-list; no pagination) | FASE 1+4 (metadata path) + FASE 5 (pagination+FTS) | `fetchNotes` → `getNotesMetadataByWorkspace`; `EXPLAIN QUERY PLAN` pakai index; no decrypt di list |
| **Performance** (12 MB; decrypt-all; re-encrypt-on-metadata; zero memo) | FASE 2 (dynamic UPDATE) + FASE 5 (lazy content, virtualisasi, memo, code-split) | `bun run build` total < 5 MB; main+vendor < 1 MB; Profiler ~15-20 item mount |
| **Testability** (zero tests; module-top repo; rules not isolated) | FASE 1 (injectable) + FASE 6 (vitest 70% gate) | `bun run test:ci` ≥ 70% services/repos/errors |
| **DRY** (mapping x4; duplicated literals) | FASE 2 + FASE 4 | mapper 1×; literal di constants |
| **YAGNI** (folderId; searchNotes/getAllNotes dead; isLoading; unused metadata method) | FASE 1 (hapus isLoading/deleteNotesByWorkspace) + FASE 4 (hapus folderId + dead method, wire metadata) | grep semua = 0 |
| **KISS** (manual BEGIN/COMMIT; editor feedback loop) | FASE 2 (autocommit + withTransaction on-demand) | `BEGIN TRANSACTION` hanya di `SQLiteDatabase.withTransaction` |
| **SRP** (store 3 responsibilities) | FASE 1 | store = thin cache; service = rules; repo = persistence |
| **DIP** (concrete repo, not injected) | FASE 1 | store → INoteService; service → INoteRepository; `new` hanya di container |
| **Separation of Concerns** (no domain/application layer) | FASE 1 | `src/domain/**` + `src/services/**` ada; layer purity guard pass |
| **Fail Fast** (silent swallowing) | FASE 3 + FASE 7 (Logger policy) | semua catch throw typed; `console.*` hanya di Logger |
| **Clean Architecture** (2-layer pragmatic) | FASE 1 | Domain + Application + Infrastructure + Presentation + Composition Root |

### FINAL GATES (semua harus hijau sebelum selesai)
1. `bun run typecheck` (tsc --noEmit) → **0 error**.
2. `bun run lint` (biome) → **0 error, 0 warning**.
3. `bun run test` (vitest) → **green**; `bun run test:ci` → coverage ≥ 70% pada services/repos/errors.
4. `bun run build` (vite) → total bundle **< 5 MB**, tidak ada chunk > 800 kB (periksa `stats.html`).
5. `cd src-tauri && cargo build --release` → **0 error** (idealnya 0 warning via clippy).
6. `bunx tauri build` → installer NSIS dihasilkan; DevTools console bersih CSP & console.error.
7. `bun run verify` → semua exit 0.

Eksekusi fase berurutan, commit per fase, verifikasi gate tiap fase. Bila satu gate merah: hentikan, perbaiki root cause (bukan suppress), lalu lanjut.
