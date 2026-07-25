# Cove Passphrase-Based Zero-Knowledge Encryption Ã¢â‚¬â€ FINAL Hardened Blueprint

> This is the architect's design with every valid adversarial fix folded in. Three CRITICAL crypto defects in the original design are corrected here: (A) the AES-GCM known-plaintext **verifier is removed** (it was a redundant offline oracle duplicating the `wrapped_dek` oracle), (B) the **raw-DEK-in-keychain recovery path (Ã‚Â§4 Option A) is removed** Ã¢â‚¬â€ it made the passphrase irrelevant to any device-session attacker and contradicted the "genuinely strong, not obfuscation" goal; recovery is now passphrase-gated or device-bound, and (C) **migration is reworked** to be deterministic and crash-safe via an explicit per-row cursor + old-key bridge snapshot, replacing the unsound "decrypt-failure-as-state" heuristic.

## 0. Crypto primitives and WHERE each lives (corrected)

| Primitive | What it is | Lives in | Extractable? | Cleared on |
|---|---|---|---|---|
| **DEK** | 256-bit AES-GCM `CryptoKey`. Encrypts note `content` (existing `ivÃ¢â‚¬â€“ciphertext` + chunked-base64 layout in `EncryptionService.ts:59-130`, reused unchanged). | **Memory only**, held on the `EncryptionService` instance. | `false` Ã¢â‚¬â€ `generateKey({AES-GCM,256}, false, ["encrypt","decrypt"])`. Never serialized. | lock / app close. |
| **KEK** | AES-GCM `CryptoKey` derived from the passphrase via PBKDF2-HMAC-SHA256, 600,000 iterations (OWASP 2026 floor). | **Memory only**. Derived on unlock, not persisted. | `false` Ã¢â‚¬â€ derived non-extractable. | lock / app close. |
| **wrapped_dek** | `base64(iv(12) Ã¢â‚¬â€“ AES-GCM-encrypt(KEK_wrap, rawDekBytes(32)))`. The single persistent ciphertext of the DEK. | **OS keychain** via `tauri-plugin-keyring` (`setPassword("com.cove.notes","dek-backup", Ã¢â‚¬Â¦)`). **Only** the wrapped form is ever stored Ã¢â‚¬â€ never raw DEK bytes. | n/a (ciphertext). | on re-key / teardown. |
| **wrap key + DEK** | Derived from the **same** PBKDF2 output via **HKDF with distinct `info` labels** (`info="dek-wrap"` vs `info="integrity-mac"`) so domain separation prevents the wrap key being reused as the MAC key. | Memory only. | `false`. | lock / app close. |
| **integrity_mac** | `base64(HMAC-SHA-256(mac_key, saltÃ¢â‚¬â€“iterationsÃ¢â‚¬â€“kdf_versionÃ¢â‚¬â€“kdf_algÃ¢â‚¬â€“wrapped_dek_refÃ¢â‚¬â€“vault_id))` Ã¢â‚¬â€ binds all KMS parameters into one authenticated envelope so a splice/swap of salt or wrapped_dek between vaults is detectable. | SQLite `kms` table. | n/a. | never. |
| **salt + kdf_version + kdf_params** | 16-byte salt + versioned KDF record (`kdf_version INT`, `kdf_alg TEXT`, `kdf_params_json TEXT` holding `{iterations}` now and `{m_cost,t_cost,p}` later for Argon2id). | SQLite `kms` table. | n/a. | never. |

**NO standalone verifier.** The original `verifier = AES-GCM(KEK, "cove-vault-ok")` is removed. Rationale (accepted attack): it was a *redundant* offline passphrase oracle Ã¢â‚¬â€ the `wrapped_dek` (random 32-byte DEK under the KEK) is already a single oracle with identical security; a constant-plaintext verifier gave the attacker a second, recognizable target with zero added security. Wrong passphrase now fails at the `wrapped_dek` GCM-tag step (fail-loud `EncryptionError(reason="decrypt_failed")`, `AppError.ts:77-86`), surfaced as a typed "wrong passphrase" message. Parameter integrity is provided instead by `integrity_mac`, which catches tampering (the real concern) without adding a brute-force surface.

Concrete KDF (OWASP-defensible, off-main-thread via SubtleCrypto):
```ts
const pbkdf2BaseKey = await crypto.subtle.importKey(
  "raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"],
);
const kek = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" },
  pbkdf2BaseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
);
// HKDF-expand into domain-separated subkeys (prevents wrap-key Ã¢â€ â€ mac-key reuse):
const wrapKey   = await hkdfExpand(pbkdf2_prk, "cove/dek-wrap/v1",     32); // AES-GCM import
const macKeyRaw = await hkdfExpand(pbkdf2_prk, "cove/integrity-mac/v1", 32); // HMAC import
```

### DEK wrap/unwrap Ã¢â‚¬â€ Pattern A (corrected; single encrypt, fresh IV, non-extractable session DEK)

The original design sketched a bug (`encrypt` called twice with the same IV). Fixed here: encrypt **once**, store once, fresh random IV per wrap.

```ts
// First-run / re-key (raw DEK material touches JS only inside this microtask):
const rawDek = crypto.getRandomValues(new Uint8Array(32));
const iv = crypto.getRandomValues(new Uint8Array(12));        // FRESH per wrap, never reused
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, rawDek));
const wrapped = new Uint8Array(12 + ct.byteLength);
wrapped.set(iv, 0); wrapped.set(ct, 12);
// persist base64(wrapped) to keychain (wrapped_dek). Import session DEK non-extractable:
const dek = await crypto.subtle.importKey("raw", rawDek, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
rawDek.fill(0); // best-effort; see Ã‚Â§11 honest note Ã¢â‚¬â€ NOT a security control
```

**Strongly recommended for v1.1** (Tauri has a Rust backend Ã¢â‚¬â€ use it): implement DEK wrap/unwrap as a `#[tauri::command]` using the `aes-gcm` + `hkdf` + `pbkdf2` crates so raw DEK bytes **never touch the JS heap**. The JS `EncryptionService` only ever holds the imported `CryptoKey` reference. This eliminates the pagefile/heap-residue class of attacks at the root. Documented as the preferred path; if cut for scope, the JS Pattern-A path above is acceptable with the documented residual.

### IV uniqueness over vault lifetime (accepted attack Ã¢â‚¬â€ no IV-collision/rotation strategy existed)

AES-GCM confidentiality catastrophically breaks on a single IV reuse under the same key. The current per-message random 12-byte IV (`EncryptionService.ts:70`) is correct but unbounded. **Fix:** add a persisted monotonic **per-DEK 96-bit IV counter** (`kms.iv_counter`, incremented atomically per `encryptPayload`) used as the deterministic IV Ã¢â‚¬â€ this is the GCM spec's RECOMMENDED mode (NIST SP 800-38D Ã‚Â§8.2.1). `encryptPayload` reads-and-increments the counter inside the same DB transaction as the note write; **fail-loud** (`EncryptionError(reason="iv_exhausted")`) when the counter approaches 2^28 (a deliberately conservative ceiling well below the 2^32 birthday bound), triggering a forced DEK rotation (Ã‚Â§4-rekey flow). This also bounds the long-lived-DEK risk without requiring AES-GCM-SIV (which SubtleCrypto does not expose).

---

## 1. First-run set-passphrase flow (reordered for crash-safety)

Triggered when the `kms` table has no row AND no in-flight migration flag. Gated behind `<SetPassphraseModal>`.

**Strong passphrase policy (NEW Ã¢â‚¬â€ `vaultPolicy.ts`)**, enforced at setup and change: minimum 12 characters, reject the top-10k common passphrases (bundled list), `zxcvbn` score Ã¢â€°Â¥ 3. **Rationale:** with the verifier removed, passphrase strength is the *only* at-rest defense for the wrapped_dek (and the *only* defense in the keychain-fallback case, Ã‚Â§11), so weak passphrases must be rejected structurally, not advised.

**Strictly ordered, durable-before-destructive** (reorders original Ã‚Â§1 to fix the "orphan DEK after mid-failure" attack):

1. Validate passphrase via `vaultPolicy`; client-side equality check. Never log/serialize plaintext.
2. Read the **legacy key** from `localStorage["cove_device_sec_key"]` (current logic, `EncryptionService.ts:6-36`) into a transient variable `legacyRawHex` Ã¢â‚¬â€ but do NOT delete it yet.
3. Generate `salt(16)`, `kdf_version=1`, `kdf_alg="PBKDF2-SHA256"`, `kdf_params_json='{"iterations":600000}'`.
4. Derive `kek` + `wrapKey` + `macKeyRaw` (HKDF-domain-separated).
5. Generate `rawDek(32)`, wrap under `wrapKey` Ã¢â€ â€™ `wrapped_dek` (Pattern A, single encrypt, fresh IV). Import session DEK non-extractable; zero `rawDek`.
6. **Persist FIRST** (durability before migration):
   a. `INSERT INTO kms (id, kdf_version, kdf_alg, kdf_params_json, salt, iv_counter, wrapped_dek_local, integrity_mac, migration_state, created_at, updated_at) VALUES (1, Ã¢â‚¬Â¦, 'pending_migration', Ã¢â‚¬Â¦)` Ã¢â‚¬â€ `wrapped_dek_local` is written here too as the **bridge snapshot** so the DEK is recoverable even if the keychain write below fails (see Ã‚Â§11 for the keychain-fallback threat-model disclosure).
   b. Write `wrapped_dek` to OS keychain `setPassword("com.cove.notes","dek-backup", base64(wrapped))`. If keychain unavailable, leave the keychain entry absent; `wrapped_dek_local` is already the fallback (Ã‚Â§11).
   c. **Round-trip verify**: read `wrapped_dek` back (keychain or local), `decrypt` under a freshly re-derived `wrapKey`, `importKey` non-extractable, and confirm it equals the session DEK by encrypting+decrypting a test nonce. **Only on verified round-trip** proceed.
7. **Bridge snapshot the legacy key** (NEW, for abort/rollback): write `legacyRawHex` into keychain as `setPassword("com.cove.notes","legacy-dek-bridge", legacyRawHex)`. This is the rollback escape hatch; it is purged in step 10 after migration is verified complete.
8. **Migrate existing notes** (USER DECISION #3) Ã¢â‚¬â€ Ã‚Â§5. Runs AFTER the DEK is durably persisted and verified, so a crash here never orphans notes under an unpersisted DEK.
9. On migration commit + integrity re-check (Ã‚Â§5): `UPDATE kms SET migration_state='complete', integrity_mac=? WHERE id=1` (recompute MAC over the now-final envelope).
10. **Delete legacy key** only now: `localStorage.removeItem("cove_device_sec_key")` AND `deletePassword("com.cove.notes","legacy-dek-bridge")`.
11. Transition `useVaultStore.status` Ã¢â€ â€™ `"unlocked"` (status flip is the LAST step; the DEK is installed on `EncryptionService` before the flip Ã¢â‚¬â€ single source of truth, see Ã‚Â§9).

---

## 2. Unlock flow (every launch after first run)

App boots to `<VaultGate>` (Ã‚Â§9).

1. Defer `SQLiteDatabase.getInstance()` until the user submits a passphrase (accepted attack: the DB singleton must not resolve during the locked render, so salt/iterations/wrapped_dek_local/titles are not readable while locked). The KMS read for status detection uses a one-shot separate `Database.load` query that does **not** resolve the singleton's full PRAGMA/migrate chain, OR the gate reads only the `kms` row existence without exposing note tables. Simplest: gate reads `SELECT 1 FROM kms LIMIT 1`; if absent Ã¢â€ â€™ `<SetPassphraseModal>`.
2. User submits passphrase Ã¢â€ â€™ derive `kek`, `wrapKey`, `macKeyRaw`.
3. **Integrity check FIRST** (replaces verifier-first): read `kms` row, recompute `integrity_mac` over `(saltÃ¢â‚¬â€“iterationsÃ¢â‚¬â€“kdf_versionÃ¢â‚¬â€“kdf_algÃ¢â‚¬â€“wrapped_dek_refÃ¢â‚¬â€“vault_id)`, constant-time compare. Mismatch Ã¢â€ â€™ typed `"vault tampered"` error, refuse to proceed (accepted splice/swap attack fix). Match Ã¢â€ â€™ proceed.
4. Read `wrapped_dek` from keychain `getPassword("com.cove.notes","dek-backup")`. If `null`, fall back to `kms.wrapped_dek_local` (Ã‚Â§11 disclosure). If both absent Ã¢â€ â€™ hard `"recovery impossible"` error; **never** silently regenerate a DEK (would orphan notes).
5. `decrypt` wrapped_dek under `wrapKey`. Wrong passphrase Ã¢â€ â€™ GCM-tag fail Ã¢â€ â€™ `EncryptionError(reason="decrypt_failed")` Ã¢â€ â€™ UI shows typed "wrong passphrase", retry. (This is the single remaining offline oracle; it is inherent to any passphrase vault and is mitigated by Ã‚Â§1's strong passphrase policy + the versioned KDF for future Argon2id migration.)
6. `importKey` non-extractable Ã¢â€ â€™ set on `EncryptionService` (install-then-flip ordering, Ã‚Â§9). Re-derive happens **once per launch** (~250-500ms); cache for the session.

---

## 3. Lock / close flow (USER DECISION #2 Ã¢â‚¬â€ hardened)

DEK is cleared from memory on lock/close. **Accepted attack:** the original relied solely on `onCloseRequested`, which does not fire on process-kill/crash/power-loss and has no await-back-pressure guarantee. Hardened with three layers:

- **Flush-then-lock ordering (NEW):** before nulling keys, `VaultService.lock()` signals the editor to flush any pending debounced save (`useSaveStatusStore` Ã¢â€ â€™ "saved" or a short 500ms timeout), awaits it, then nulls the DEK. Prevents the accepted attack where a debounced `updateNote` fires after `lock()` and throws `key_unavailable`, losing the last keystrokes.
- **Explicit plaintext teardown (NEW):** `lock()` also: clears `useNoteStore.notes`/`activeNoteId` (which after Ã‚Â§6 stay metadata-only anyway), closes `<QuickSearchModal>` and nulls its hit state, and calls `editor.replaceBlocks(editor.document, [])` on any mounted `BlockNoteEditor` to drop the in-memory document + `lastLoadedContentRef`. (Accepted attack: editor closures and search snippets retained plaintext in heap after lock.)
- **Rust-side teardown hook (NEW):** register `tauri::RunEvent::ExitRequested` and `WindowEvent::Destroyed` handlers in `main.rs` that log unclean exits (Rust cannot null a JS field, but provides defense-in-depth telemetry and runs even when the JS renderer is already gone).
- **Idle-timeout auto-lock (NEW Ã¢â‚¬â€ promoted from "future" to first-class):** `useVaultStore` starts an idle timer (default 15 min, configurable) reset on user input; on expiry calls `lock()`. This is the real mitigation for the backgrounded/idle session residual (accepted attack: a backgrounded session keeps the DEK alive for the whole window).
- **Honest disclosure (NEW):** the threat model explicitly states that on a hard crash/process-kill, the OS may page the renderer's memory (decrypted note strings + the non-extractable CryptoKey's native backing material) to the pagefile/swap. This is a **residual risk** that cannot be fully eliminated in-process; the mitigations are the idle auto-lock (shrinks the window) and recommending OS-level full-disk encryption + disabling swap for high-security deployments.

`lock()` is wrapped in try/finally that **always** nulls both `dek` and `kek` fields last (idempotent), then asserts `EncryptionService.isUnlocked() === false` and logs if not (accepted attack: a throwing `lock()` could leave keys live while UI shows locked).

---

## 4. Recovery flow (USER DECISION #1 Ã¢â‚¬â€ reworked; raw-DEK path REMOVED)

**Accepted CRITICAL attack:** storing the raw DEK in the keychain (`dek-recovery-raw`) made the passphrase cryptographically irrelevant to any device-session attacker (Windows DPAPI decrypts user-scoped entries with no prompt; macOS "login" keyring unlocks at login; Linux Secret Service with autologin is plaintext-at-rest). This directly contradicted the project goal. **Removed.**

Recovery is now strictly **passphrase-gated OR device-bound** Ã¢â‚¬â€ never raw:

- **Forgot passphrase, same device** (the user decision's actual intent): the user re-enters the passphrase. If remembered, the standard Ã‚Â§2 unlock works (keychain `wrapped_dek` is just a convenience copy; the DB's `wrapped_dek_local` is always present as the durable fallback). No raw key needed.
- **Passphrase truly forgotten**: recovery requires a **device-bound key** that itself never leaves hardware. Two acceptable implementations (pick one for v1, mark the other as v1.1):
  - **Option B (preferred for v1):** do **not** offer passphrase-less recovery. Surface an honest "reset vault" path that **deletes** the encrypted notes (fail-loud, no silent regeneration). This is strict zero-knowledge. The README and the `cove-encryption-not-zero-knowledge` memory note are updated to state: *passphrase-derived keys are strong AT REST against an offline DB thief; passphrase-less recovery is intentionally NOT offered Ã¢â‚¬â€ forgetting the passphrase means data loss, by design.*
  - **Option C (v1.1, true device-bound recovery):** maintain a second wrapped entry `dek-device-wrapped` = `AES-GCM-encrypt(deviceBoundKey, rawDek)` where `deviceBoundKey` is derived from a platform hardware key: Windows DPAPI with `CRYPTPROTECT_LOCAL_MACHINE` tied to the user SID (useless if copied to another machine/user), macOS Secure Enclave / `kSecAttrTokenIDSecureEnclave`, Linux `secret-service` with a non-exportable key. The `dek-backup` (passphrase-wrapped) entry stays for normal unlock. Recovery = `getPassword("com.cove.notes","dek-device-wrapped")` Ã¢â€ â€™ hardware-decrypt Ã¢â€ â€™ `importKey` non-extractable Ã¢â€ â€™ user is forced through Ã‚Â§1 re-key (without migration) to set a new passphrase. This satisfies USER DECISION #1 (OS-keychain recovery) **without** eliminating the zero-knowledge property, because the device-bound key is non-exportable.
- If neither keychain entry exists (fresh device, keychain wiped) and no `wrapped_dek_local` (or `wrapped_dek_local` is present but passphrase forgotten): **recovery is impossible** Ã¢â‚¬â€ hard error. Correct and disclosed.

---

## 5. Migration of existing old-key notes (USER DECISION #3 Ã¢â‚¬â€ reworked for crash-safety)

**Accepted CRITICAL attack:** the original resume heuristic ("detect already-migrated rows by attempting new-key decrypt and skipping on success") is unsound Ã¢â‚¬â€ AES-GCM tag failure cannot distinguish "old-key, must migrate" from "corrupt, skip," and the heuristic could leave the vault unrecoverable. Also accepted: a single giant transaction over thousands of rows holds the WAL lock and blocks all reads; one corrupt row aborts the whole pass and bricks the vault.

**Reworked Ã¢â‚¬â€ deterministic, batched, resumable, with bridge-key rollback:**

1. `notes` table gains a `kms_version INTEGER NOT NULL DEFAULT 0` column (user_version 3 migration). `0` = legacy (old localStorage key); `1` = current DEK generation.
2. Before migration, the legacy key is bridge-snapshotted (Ã‚Â§1 step 7) so an abort can roll back.
3. Set `kms.migration_state='in_progress'` **inside** the first batch transaction (not before BEGIN), so a crash before any row UPDATE leaves state as `pending_migration`/`complete` (no false in_progress).
4. Process rows in **id-sorted order, in batches of 50**, each batch in its own short `SQLiteDatabase.withTransaction` (`SQLiteDatabase.ts:98-111`):
   - `SELECT id, content FROM notes WHERE kms_version = 0 ORDER BY id LIMIT 50 OFFSET ?`
   - For each row: `legacyDecryptPayload(content, legacyRawHex)` Ã¢â€ â€™ on success re-`encryptPayload` with the session DEK Ã¢â€ â€™ `UPDATE notes SET content=?, kms_version=1 WHERE id=?`. On failure (corrupt/malformed), record the `id` in a `migration_failures` table and **continue** (do not abort the batch). Before re-encrypting, sanity-check the decrypted plaintext is non-empty/valid JSON-array-ish; a NULL/empty row is flagged, never silently blanked (accepted attack: `encryptPayload` returns `""` for empty input, hiding data loss).
   - Commit the batch.
5. Record a high-water-mark `kms.migration_cursor = <last processed id>` after each committed batch, so the resumer picks up exactly where it stopped Ã¢â‚¬â€ no decrypt-failure-as-state.
6. On completion: recompute `integrity_mac`, `UPDATE kms SET migration_state='complete'`. Re-read a random sample of migrated rows and decrypt with the persisted+unwrapped DEK to confirm round-trip (post-migration integrity check).
7. **Abort path (NEW):** if the user (or a max-retry counter) decides to abort, `VaultService.abortMigration()` restores old-key access from the bridge snapshot, sets all `kms_version` back to 0, and drops the `kms` row Ã¢â‚¬â€ returning the vault to its pre-setup state. Available only while the bridge entry exists.
8. **End-to-end migration tests** (`VaultService.test.ts`) kill the process at each of: before-first-batch-BEGIN, mid-batch-N, after-batch-commit-before-cursor-update, after-all-batches-before-state-update. Each must resume deterministically.

A crash between batch BEGIN/COMMIT rolls back that batch only (`SQLiteDatabase.ts:105-109`); the cursor guarantees forward progress.

---

## 6. Decrypt-on-search (fixes broken body search Ã¢â‚¬â€ scope-limited, lock-safe, perf-bounded)

Current search is dead/broken: `QuickSearchModal` (`QuickSearchModal.tsx:42-128`) iterates `useNoteStore.notes`, but `fetchNotes` (`useNoteStore.ts:36-49`) calls `listMetadataByWorkspace` Ã¢â€ â€™ `getNotesMetadataByWorkspace` (`SQLiteNoteRepository.ts:47-58`) which selects **metadata only** with `decrypt: false`, so `note.content === ""` and `extractPlainText` (`QuickSearchModal.tsx:11-40`) always returns `""`. The repo's dead `searchNotes` (`SQLiteNoteRepository.ts:193-199`) and store's `searchQuery`/`setSearchQuery` (`useNoteStore.ts:11,34`) are removed (YAGNI discipline; deleted unambiguously, never "repurposed" Ã¢â‚¬â€ accepted attack: repurposing risks signature drift).

**Hardened design Ã¢â‚¬â€ scope-limited decrypt-on-search (accepted CRITICAL attacks: plaintext-retention-after-lock, O(N)-crypto-per-keystroke UX DoS, missing unlock gate):**

1. `fetchNotes` **stays metadata-only** (content=""). The active store never holds bodies (accepted attack: keeping decrypted bodies in the Zustand store widened the plaintext surface).
2. New service `INoteService.searchAcrossWorkspaces(query: string): Promise<NoteSearchHit[]>`, backed by a repo method `findNoteHits` (distinct name Ã¢â‚¬â€ no collision with the deleted `searchNotes`):
   - Loads only `(id, workspaceId, title, icon, content, updatedAt)` for the top-**K=100 most-recently-updated** rows (hard cap; "refine your search" affordance beyond K).
   - Decrypts each `content` with the session DEK **inside the function scope**, builds the snippet (matched region, capped 60 chars), and lets the full decrypted string go out of scope at function return Ã¢â‚¬â€ the returned DTO holds **only** `{id, workspaceId, title, icon, snippet}`, never the full body.
   - **Defense-in-depth gate:** if `!encryptionService.isUnlocked()`, short-circuit return `[]` and log `vault_locked` (accepted attack: a status/DEK race could throw `key_unavailable` mid-search).
3. `QuickSearchModal` wiring:
   - Debounced `useEffect` on `Command.Input` value (300ms) calling `searchAcrossWorkspaces`. AbortController cancels the **next** scheduled call (note: in-flight `crypto.subtle.decrypt` is uncancellable Ã¢â‚¬â€ the debounce + K-cap is the real mitigation).
   - Chunked decryption yields to the event loop between batches (`scheduler.yield` / `setTimeout(0)`) so the UI stays responsive.
   - On `lock()` (Ã‚Â§3), the modal closes and its hit state is nulled; any in-flight Promise resolution is ignored (token-bumped).
   - **Perf gate test** (phase-5 discipline): vitest bench fails if a search pass over 1,000 notes exceeds 50ms on the reference machine.
4. **Plaintext-cache option (v1.1):** optionally decrypt-once-at-load when a note is opened in the editor and cache its plaintext keyed by id (invalidated on update); search then filters the cache (O(N) string-includes, no crypto). Out of scope for v1; flagged.

---

## 7. `EncryptionService` Ã¢â‚¬â€ static Ã¢â€ â€™ instance + session DEK + service-layer lock gate

Currently a static class with private static `masterKey` (`EncryptionService.ts:3-36`); callers do `EncryptionService.encryptPayload(...)` (`SQLiteNoteRepository.ts:22,90,139`). Refactored to an **instance** injected through `container.ts` (`container.ts:10-17`) to preserve Clean Architecture testability (phase-6 fakes, 93% coverage).

- Instance class with `private dek: CryptoKey | null`, `private kek: CryptoKey | null`.
- Public: `setSessionKeys({dek, kek})`, `clearSessionKeys()` (try/finally, always-nulls-last, idempotent), `isUnlocked(): boolean`, `encryptPayload(plain)`, `decryptPayload(b64)`. The chunked base64 helpers (`EncryptionService.ts:38-57`) move to private instance methods unchanged.
- Pure unit-testable crypto helpers: `deriveKek(passphrase, salt, iterations)`, `hkdfExpand(prk, info, L)`, `wrapDek(wrapKey, rawDek)`, `unwrapDek(wrapKey, wrapped)`, `computeIntegrityMac(macKey, fields)`, `constantTimeEqual(a, b)`.
- `encryptPayload`/`decryptPayload` read `this.dek`; if `null` Ã¢â€ â€™ `EncryptionError(reason="key_unavailable", "Vault is locked")` (matches taxonomy, `AppError.ts:71-86`). **NEW:** `encryptPayload` also reads-and-increments the persisted `iv_counter` (Ã‚Â§0) atomically with the note write.
- Define `IEncryptionService` for DI/fakes.
- `SQLiteNoteRepository` constructor takes `IEncryptionService` instead of the static class. `container.ts` constructs one `EncryptionService` singleton, injects into `SQLiteNoteRepository` and `VaultService`.
- **Service-layer lock gate (accepted HIGH attack Ã¢â‚¬â€ original gated only at React level):** `NoteService` (and `VaultService`) check `encryptionService.isUnlocked()` before **any** repo call, including metadata reads, throwing a typed `VaultLockedError`. This prevents a locked app from reading titles/encrypted-blobs via a non-React path (selector, scheduled task, error-boundary fallback).

---

## 8. `VaultService` Ã¢â‚¬â€ orchestrates setup/unlock/lock/recovery/migration

```ts
interface IVaultService {
  status(): "uninitialized" | "locked" | "unlocked" | "migration_in_progress";
  setupPassphrase(passphrase: string): Promise<void>;            // Ã‚Â§1 + Ã‚Â§5 migration
  unlock(passphrase: string): Promise<void>;                     // Ã‚Â§2
  lock(): Promise<void>;                                         // Ã‚Â§3 (async: flush + teardown)
  changePassphrase(oldPw: string, newPw: string): Promise<void>; // re-wrap same DEK under new KEK, recompute MAC + salt
  changeKdf(newKdfParams): Promise<void>;                        // versioned KDF upgrade path (Argon2id future)
  abortMigration(): Promise<void>;                               // Ã‚Â§5 rollback via bridge key
}
```

Depends on `IEncryptionService`, a new `IKmsRepository` (reads/writes the `kms` table), and `IKeychainStore` (abstracted so tests use an in-memory fake per phase-6). `container.ts` wires it as a singleton.

`useVaultStore` (new Zustand store) holds `status` + an `idleTimer`; **status is derived from a single source of truth** (accepted attack: two independent fields can disagree): `status = dekPresent ? (migrationState==='in_progress' ? 'migration_in_progress' : 'unlocked') : (kmsRowExists ? 'locked' : 'uninitialized')`. The DEK is installed on `EncryptionService` **before** `status` flips to `unlocked` (install-then-flip, unit-tested).

**Write-freeze during migration (accepted HIGH attack Ã¢â‚¬â€ original raced concurrent editor writes):** `useVaultStore.isMigrating` flag; `NoteService.createNote/updateNote/deleteNote` check it and throw `MigrationInProgressError`. `<VaultGate>` **unmounts** `<AppContent>` (not overlay) while `SetPassphraseModal`/`MigrationInProgress` is shown. `setupPassphrase` transitions `status` to `migration_in_progress` **before** migration starts. Pending editor debounces are drained/cancelled before the first batch BEGIN.

---

## 9. App gating Ã¢â‚¬â€ VaultGate before main UI

`App.tsx` (`App.tsx:21-141`) currently renders `AppContent` unconditionally. Wrapped:
```tsx
export const App: React.FC = () => (
  <ErrorBoundary><VaultGate /></ErrorBoundary>   // reads useVaultStore.status
);
```
`VaultGate` renders `SetPassphraseModal` (uninitialized), `UnlockScreen` (locked), `MigrationInProgress` (migration_in_progress, resumes Ã‚Â§5), or `<AppContent />` (unlocked). `AppContent`'s `fetchWorkspaces`/`fetchNotes` effects (`App.tsx:26-34`) only mount after unlock Ã¢â‚¬â€ guaranteed because the gate doesn't mount `AppContent` earlier, **and** the service-layer lock gate (Ã‚Â§7) is the defense-in-depth backstop for any non-React path. Window-close + idle listeners registered in `VaultGate`'s effect.

---

## 10. Schema / migration (user_version 3)

Schema-only (data migration is runtime, Ã‚Â§5, because it needs keys not present at DB-init). Added to the ladder at `SQLiteDatabase.ts:65-95`:
```sql
CREATE TABLE IF NOT EXISTS kms (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  kdf_version INTEGER NOT NULL,
  kdf_alg TEXT NOT NULL,                 -- 'PBKDF2-SHA256' now; 'ARGON2ID' later
  kdf_params_json TEXT NOT NULL,         -- '{"iterations":600000}' / '{"m_cost":...,..}'
  salt BLOB NOT NULL,                    -- 16 bytes
  iv_counter INTEGER NOT NULL DEFAULT 0, -- per-DEK monotonic IV counter (Ã‚Â§0)
  wrapped_dek_local TEXT,                -- bridge snapshot + keychain-less fallback (Ã‚Â§11)
  integrity_mac TEXT NOT NULL,           -- HMAC envelope binding all fields (Ã‚Â§0)
  migration_state TEXT NOT NULL DEFAULT 'complete',  -- 'pending_migration'|'in_progress'|'complete'
  migration_cursor TEXT,                 -- high-water-mark id (Ã‚Â§5)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
ALTER TABLE notes ADD COLUMN kms_version INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS migration_failures (id TEXT PRIMARY KEY, reason TEXT, at INTEGER NOT NULL);
PRAGMA user_version = 3;
```

---

## 11. Keychain-fallback threat model (accepted HIGH/MEDIUM attack Ã¢â‚¬â€ doubled oracle)

When the OS keychain is unavailable (headless Linux, no Secret Service), `wrapped_dek` lives in `kms.wrapped_dek_local` in the **same** DB file. **Accepted attack:** combined with any verifier this doubled the offline crack surface. **Mitigations folded in:**

- The standalone verifier is **removed** (Ã‚Â§0), so there is only **one** offline oracle (the `wrapped_dek` itself), whether in keychain or in `wrapped_dek_local`. Identical security in both cases.
- For keychain-less users, the offline-DB threat model reduces to **passphrase-strength-only**. This is disclosed prominently in `<SetPassphraseModal>`: *"Recovery backup stored in app data; an attacker who steals your database can brute-force your passphrase. Use a strong passphrase (enforced)."* The strong passphrase policy (Ã‚Â§1) is the structural mitigation.
- `wrapped_dek_local` is written by default (it is also the bridge snapshot for abort/rollback, Ã‚Â§1 step 6a) Ã¢â‚¬â€ but the keychain entry is preferred when available and the disclosure above is shown only when the keychain write failed.

---

## Native plugin wiring (research `keychainApproach`)

- `src-tauri/Cargo.toml` (`Cargo.toml:11-17`): add `tauri-plugin-keyring = "2"` (pin exact patch per research risks Ã‚Â§8; verify the JS package name resolves under bun Ã¢â‚¬â€ npm `tauri-plugin-keyring-api`).
- `src-tauri/src/main.rs` (`main.rs:12-15`): add `.plugin(tauri_plugin_keyring::init())` next to `.plugin(tauri_plugin_sql::Builder::default().build())` at line 13. **NEW (Ã‚Â§3):** add a `RunEvent::ExitRequested` / `WindowEvent::Destroyed` handler for unclean-exit telemetry.
- `src-tauri/capabilities/default.json` (`default.json:6-12`): add least-privilege perms `keyring:allow-set-password`, `keyring:allow-get-password`, `keyring:allow-delete-password` (avoid broad `keyring:default`). **Residual risk (accepted LOW attack):** the main window still holds both `sql:*` and `keyring:*`; a single compromised renderer dep gets both. Mitigation: npm audit / SBOM as a supply-chain control; consider isolating crypto/keyring into a separate webview with narrower capabilities if Tauri 2 supports it (v1.1).
- Frontend: `bun add tauri-plugin-keyring-api`; `import { getPassword, setPassword, deletePassword }`. Service `"com.cove.notes"`; users `"dek-backup"` (passphrase-wrapped), `"legacy-dek-bridge"` (Ã‚Â§1 step 7, transient), and (v1.1 Option C) `"dek-device-wrapped"`.

---

## Failure modes (corrected)

- **WRONG PASSPHRASE**: GCM-tag fail on `wrapped_dek` unwrap Ã¢â€ â€™ `EncryptionError(reason="decrypt_failed")` Ã¢â€ â€™ typed "wrong passphrase", retry on `UnlockScreen`. (Verifier removed; this is the single oracle.)
- **VAULT TAMPERED** (NEW): `integrity_mac` mismatch Ã¢â€ â€™ typed error, refuse unlock. Catches salt/wrapped_dek splice/swap.
- **KEYCHAIN UNAVAILABLE**: fall back to `wrapped_dek_local`; disclose (Ã‚Â§11); setup/unlock proceed.
- **MIGRATION INTERRUPTED**: batched transactions + `migration_cursor` resume deterministically; corrupt rows recorded in `migration_failures` and skipped (never abort the whole pass); bridge key enables `abortMigration()`.
- **MIGRATION RACE**: `MigrationInProgressError` from service-layer write-freeze; `AppContent` unmounted during migration.
- **SETUP MID-FAILURE**: DEK persisted + round-trip-verified BEFORE migration; legacy key deleted only after `migration_state='complete'` + integrity re-check.
- **LOCK DURING IN-FLIGHT WRITE**: `lock()` flushes pending saves first; service-layer gate throws `VaultLockedError` post-lock.
- **IV EXHAUSTION** (NEW): counter approaches 2^28 Ã¢â€ â€™ forced DEK rotation via Ã‚Â§4-rekey flow.
- **DEK NOT SET**: `EncryptionError(reason="key_unavailable")`; service-layer gate is defense-in-depth.
- **RECOVERY IMPOSSIBLE**: no keychain entry AND no `wrapped_dek_local` (or passphrase forgotten with no device-bound key) Ã¢â€ â€™ hard error; never silently regenerate.

---

## Documentation updates (binding)

- README and `D:\Cfg\claude\projects\D--remote-cove\memory\cove-encryption-not-zero-knowledge.md` revised to state: *passphrase-derived keys are genuinely strong AT REST against an offline DB thief (key not on disk next to DB); a device-session attacker who can unlock the OS session AND for whom a device-bound recovery key (v1.1 Option C) is configured can recover Ã¢â‚¬â€ raw-DEK keychain storage is NOT used. Passphrase-less recovery is intentionally not offered in v1 (forgotten passphrase = data loss, by design).*
- User-facing disclosure in `<SetPassphraseModal>`: the at-rest threat model, the keychain-fallback caveat (Ã‚Â§11), and "lock when stepping away Ã¢â‚¬â€ plaintext is resident in process memory while unlocked."