# Enterprise Code Review — `cove-notes`

> Tanggal: 2026-07-30 · Metode: pemahaman mendalam + workflow multi-agen (81 agen, 3,1 jt token): 12 reviewer senior per-layer → verifikasi adversarial per-temuan (setiap klaim dicek ulang oleh agen skeptis yang membaca kode nyata).
>
> **Total temuan terverifikasi:** ~50 (0 critical, 11 high, ~25 medium, ~16 low/info) + 2 refuted (false-positive yang ditolak).

---

## 1. Ringkasan Eksekutif

`cove-notes` adalah aplikasi desktop catatan **terenkripsi at-rest** berbasis Tauri 2 + React 18 + TypeScript. Pertama, yang penting untuk diluruskan: **ini bukan kode "tahap awal" yang biasa.** Tingkat kematangannya di atas rata-rata codebase production — terutama kriptografi vault dan disiplin layering-nya.

Namun ada **cluster isu nyata yang terkonsentrasi** di beberapa area, dengan beberapa yang berdampak **kehilangan data permanen** dan **pelemahan batas keamanan inti vault**. Kabar baiknya: hampir semuanya berakar pada **3-4 penyebab sistemik** yang bisa diperbaiki terfokus, bukan ratusan bug acak.

| Dimensi | Penilaian | Catatan |
|---|---|---|
| Clean Architecture | 🟢 Baik | Layering inti benar; domain bersih. Beberapa kebocoran boundary. |
| Clean Code / SOLID | 🟢 Baik | Naming, fungsi kecil, DRY umumnya baik. Pola berulang di state. |
| Type Safety | 🟢 Baik (strict) | `strict`, `noUncheckedIndexedAccess`, no-`any`. Beberapa celah hygiene. |
| Security (Crypto) | 🟢 Kriptografi matang | AES-GCM/Argon2id/HKDF benar. Tapi cakupan enkripsi & permukaan kunci ada celah. |
| Data Integrity | 🔴 Perlu perhatian | Pool plugin-sql merusak atomisitas → beberapa jalur data-loss. |
| Scalability | 🟡 Cukup | Load-all ke memori, decrypt-on-search. OK untuk skala kini, rapuh saat tumbuh. |
| Maintainability | 🟢 Baik | Kohesi/coupling sehat. Service-locator & duplikasi minor. |
| Twelve-Factor | 🟡 Sebagian | Config hardcode; logging tak ter-gating; observabilitas tipis. |

---

## 2. Kelebihan yang Patut Dipertahankan ✅

1. **Kriptografi vault benar-benar solid.** AES-GCM dengan counter IV deterministik (NIST SP 800-38D §8.2.1) yang *dipersist sebelum dipakai* (anti IV-reuse saat crash); **Argon2id** untuk vault baru + PBKDF2 600k OWASP untuk legacy; **HKDF** subkey derivation (wrap-key + MAC-key terpisah); **integrity MAC length-prefixed** (anti ambiguitas concat); **constant-time compare**; **zeroization** key; **IV exhaustion limit** 2²⁸ di bawah birthday bound; **serialisasi unlock konkuren** (`unlockInFlight`); **DEK rotation** yang mereset IV space untuk mencegah nonce reuse. Komentar "mengapa"-nya enterprise-grade.
2. **Layering bersih & DI manual.** Port (`I*Service`, `I*Repository`) + adapter SQLite + composition root di `di/container.ts`. Arah dependensi UI→store→service→repo→domain pada dasarnya benar; `domain/` diverifikasi tidak mengimpor infrastruktur.
3. **Error bertipe terstruktur.** Hierarki `AppError` (kategori enum, `userFacing`, cause-chaining ES2022, `toJSON`) + `errorPresenter` memetakan ke UI. Biome melarang `any`/`console`.
4. **Migrasi DB terversi** (`user_version` 1→10) dengan PRAGMA tepat (WAL, `foreign_keys`) dan backfill idempoten.
5. **Virtualisasi list** (@tanstack/react-virtual) + lazy-loading editor berat + code-splitting vendor chunk yang masuk akal.

---

## 3. Temuan Prioritas Tinggi (HIGH) — 11 ditemuan 🔴

### Tema A — Pool koneksi `tauri-plugin-sql` merusak atomisitas (akar masalah terbesar)

Plugin SQL Tauri memakai pool sqlx multi-koneksi; **setiap `execute` bisa mendarat di koneksi berbeda** (kode mengakuinya di `SQLiteDatabase.ts:47-49`).

| ID | Lokasi | Masalah | Dampak |
|---|---|---|---|
| **H1** | `SQLiteNoteLinkRepository.ts:13` | `replaceForSource` = DELETE + loop INSERT terpisah tanpa transaksi; `deleteNote`/`deleteNotesByWorkspace` cascade manual multi-statement | Kehilangan relasi/backlink permanen saat kegagalan parsial (link bisa re-derive dari konten, tapi tag/cover/properties pada delete tidak self-heal) |
| **H2** | `SQLiteDatabase.ts:86` | Migrasi v2 `recreate-table` dibungkus `BEGIN…COMMIT` yang sebenarnya tidak atomik lintas pool — kontradiksi dengan komentar sendiri | Kehilangan SEMUA catatan bila crash antara `DROP TABLE notes` dan `RENAME` saat upgrade dari v1 |
| **H3** | `WorkspaceService.ts:41` | `deleteWorkspace` hard-delete seluruh note dulu, baru workspace — non-atomik; + parameter `currentWorkspacesCount` dipercaya dari caller (UI), bukan di-query service | Note hilang permanen tanpa recovery bila langkah ke-2 gagal; bypass aturan "tak boleh hapus workspace terakhir" bila cache UI basi |
| *(medium terkait)* | `SQLiteDatabase.ts:21` | PRAGMA per-koneksi hanya dipasang di 1 koneksi → itulah sebabnya cascade manual dipakai; tuning performa tak terasa pool-wide | Inefisiensi + ketergantungan pada cascade manual yang rapuh |

> **Akar solusi (Rust-side, satu perbaikan menyelesaikan banyak):** pakai `SqliteConnectOptions` dengan `foreign_keys(true)` + hook `after_connect` untuk PRAGMA, **atau** `max_connections(1)`, **atau** jalankan operasi multi-write via satu command Rust yang memegang satu koneksi `db.transaction()`.

### Tema B — Race data-loss di UI/editor (optimistic state + debounce)

| ID | Lokasi | Masalah | Dampak |
|---|---|---|---|
| **H4** | `BlockSuiteSurface.tsx:30` | Saat `engine==="blocksuite"` (opt-in Settings), editor di-mount sebelum konten async tiba → doc di-seed kosong, lalu `initializedDocs` mengabaikan snapshot asli | Konten asli permanen hilang begitu user mengetik 1 karakter. Hanya saat engine eksplisit BlockSuite. |
| **H5** | `EditorHeader.tsx:75` | Debounce judul (300ms) tidak di-flush saat unmount — cleanup hanya `clearTimeout`. Editor di-`key` per note | Judul baru hilang permanen bila ganti note <300ms setelah ketik |
| *(medium terkait)* | `useNoteStore.ts:141` | `updateNote` persist content ATAU metadata eksklusif, padahal patch optimistik menerapkan semua field | Latent: caller yang kirim `{title, content}` bersamaan → title tampil tapi tak tersimpan |

### Tema C — Cakupan enkripsi & permukaan kunci

| ID | Lokasi | Masalah | Dampak |
|---|---|---|---|
| **H6** | `SQLiteNoteRepository.ts:20` | Enkripsi at-rest hanya `content` + `cover`. `title`, `icon`, `tags`, `links`, timestamp, dan FTS index plaintext | Pencuri `cove.db`/backup membaca semua judul + struktur tanpa passphrase |
| **H7** | `DeviceBind.ts:7` | DPAPI `CryptProtectData` tanpa optional entropy → blob hanya terikat akun-user | Info-stealer same-user bisa unwrap `dek-backup` → raw DEK → dekripsi semua note tanpa passphrase |
| **H8** | `VaultService.ts:144` + `SQLiteKmsRepository.ts:107` | `ivCounter` tak terikat MAC integritas + `setIvCounter` UPDATE mentah tanpa guard monotonic | Penyerang dengan akses tulis DB menurunkan counter → IV reuse AES-GCM → recovery plaintext + forgery |
| **H9** | `VaultGate.tsx:26` | Effect `tryAutoUnlock` reaktif terhadap setiap transisi ke "locked", bukan hanya launch | Klik "Lock Now" → langsung auto-unlock lagi. Kontrol keamanan inti dikalahkan |
| *(medium terkait)* | `VaultService.ts:89` | Raw DEK extractable dipertahankan di heap renderer sepanjang sesi | Blast-radius kompromi renderer dari transient jadi persisten |

### Tema D — Blast radius error handling

| ID | Lokasi | Masalah | Dampak |
|---|---|---|---|
| **H10** | `blockSuiteContent.ts:53` | `docFromSnapshot`/`applyUpdate` tanpa try/catch; dipanggil di loop search tanpa guard per-item | Satu catatan corrupt mematikan search & save untuk SEMUA catatan |
| **H11** | `SettingsModal.tsx:75` | `handleConfirmRestore` hanya ada path `catch`; path sukses tak reset state dan tak panggil `db.resume()` | Restore sukses meninggalkan aplikasi rusak: spinner abadi + DB suspended |

---

## 4. Temuan Prioritas Menengah (MEDIUM) — tema utama 🟡

- **Konkurensi non-atomik lain:** `TagService.addTag` (find-then-create, race UNIQUE); `PropertyService.addOption` (read-modify-write `optionsJson` → lost update senyap); sinkronisasi `note_links` non-atomik vs konten.
- **Resiliensi data:** `deserializePropertyValue` menelan error parse/mismatch diam-diam; `searchTitlesFts` menelan semua error FTS; `blockTree`/`plainText` menelan JSON parse error. **Pola: terlalu banyak `catch` kosong/swallow.**
- **Scalability:** load seluruh metadata/trash/tag ke memori tanpa pagination/LIMIT; `searchAcrossWorkspaces` decrypt 100 note sekuensial per query (magic number); tidak ada indeks search plaintext. OK sekarang, rapuh di 10rb+ note.
- **State management (Zustand):** pola subscribe seluruh-store tanpa selector di banyak komponen → render storm; `useWorkspaceStore` mencampur data domain + flag UI (SRP); `notifyError` diduplikasi di 3 store + inline di 5 komponen.
- **Type safety hygiene:** `tsconfig` membocorkan `vitest/globals` ke seluruh scope kode produksi.
- **Build fragility:** `vite/blocksuite.ts` — hack ESM-interop regex di luar cakupan tsc/biome, `any`/`catch{}` kosong, terkunci exact `0.22.4`.
- **Domain boundary:** `coverAad` (konsep kripto) di `domain/note`; `notePolicy.ts` melanggar SRP; error domain didefinisikan di luar domain (`domain/errors.ts` hanya shim).
- **UX jank:** `framer-motion layout` di dalam item virtualizer; heading level 4-6 BlockNote diratakan ke h1 (lossy); ekstraksi teks inline diduplikasi dengan perilaku divergen.

---

## 5. Temuan Rendah/Info (LOW/INFO) — ringkasan ⚪

Field domain tak `readonly`; `Switch` men-spread `{...props}` setelah `onClick` internal (menimpa toggle); `APP_LOCALE` dead-code + `time.ts` hardcode `en-US`; barrel `types/index.ts` tak lengkap; `Logger.emit` tanpa level filtering; magic number PRAGMA; `metaCache` link bertahan lewati lock; toast tanpa `aria-live`/cap; effect auto-select dead-code di `App.tsx`; `onLock` tanpa unsubscribe; dst.

---

## 6. Root Causes (4 akar masalah)

1. **🔴 Pool `tauri-plugin-sql`** → merusak PRAGMA-persistence, FK-cascade, dan semua transaksi multi-statement. Satu perbaikan di Rust menutup H1/H2/H3 + 4-5 medium. Prioritas tertinggi ROI.
2. **🟠 Optimistic-state + debounce tanpa flush-on-unmount** → H4, H5, + updateNote. Butuh kontrak "flush pending sebelum navigasi/unmount" yang seragam.
3. **🟠 Cakupan enkripsi & tamper-evidence IV counter** → H6, H7, H8. Primitif kripto benar; yang kurang adalah cakupan field, entropy device-bind, dan monotonicity IV counter.
4. **🟡 Observabilitas & fail-fast** → banyak `catch` swallow + service tak emit `Logger` + store tanpa state loading/error.

---

## 7. Roadmap Perbaikan

**P0 — Blok rilis (data integrity & security inti):** pool SQL di Rust (H1/H2/H3); `ivCounter` monotonic + MAC (H8); DPAPI entropy (H7); gate auto-unlock session (H9); flush title + gate mount editor (H4/H5); try/catch per-item search/envelope (H10); reset state + resume di restore (H11).

**P1 — Konsistensi & resiliensi:** transaksikan tag/property/link write; perluas enkripsi ke `title` (atau dokumentasikan eksplisit); ganti swallow-catch dengan `Logger` + degradasi; `readonly` domain; perbaiki `Switch` onClick.

**P2 — Hygiene & skalabilitas:** selector Zustand seragam + pisahkan `useUIStore`; pagination/cursor repo; keluarkan `vitest/globals` dari tsconfig produksi; masukkan `vite/` ke cakupan tsc/biome + smoke test; pisahkan `notifyError` ke helper; rapikan boundary domain.

---

## 8. Testing

Tidak dinilai (sesuai permintaan). Catatan strategis: test codec editor (`yjsCodec`, `blockSuiteContent`, `contentFormat`) dan crypto adalah *regression net* bernilai tinggi untuk hal persis yang di-flag di H8/H10. **Rekomendasi: tahan dulu, pisahkan ke folder `tests/` terpisah + tsconfig terpisah, jangan hapus.**

---

## 9. Temuan yang Ditolak (Refuted) — bukti ketelitian

- ~~`setTrustDevice` menyatukan escrow + auto-unlock = bug keamanan~~ → **Refuted**: UI (`messages.ts:135`) mendokumentasikan keduanya; memakai entry keychain identik — desain produk sengaja.
- ~~`BlockStdScope` tak pernah unmount = kebocoran memori~~ → **Refuted** (cleanup memadai).

---

## 10. Verdict Penutup

> `cove-notes` adalah codebase dengan arsitektur & kriptografi di atas rata-rata, tetapi belum siap "production-grade" karena beberapa jalur data-loss dan celah cakupan keamanan yang nyata. Kerusakannya terkonsentrasi, bukan menyebar — terutama di sekitar model pool SQL Tauri dan beberapa race optimistic-state di editor. Selesaikan P0 dan kodebase ini naik kelas secara signifikan.
