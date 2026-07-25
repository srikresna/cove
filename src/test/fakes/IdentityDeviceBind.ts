import type { IDeviceBind } from "../../services/vault/IDeviceBind";
import type { Bytes } from "../../services/vault/crypto";

/**
 * Identity device-bind fake for unit tests: wrap/unwrap are pass-through
 * (no DPAPI). Used by VaultService tests so they run in vitest without Tauri.
 */
export class IdentityDeviceBind implements IDeviceBind {
  async wrap(plaintext: Bytes): Promise<Bytes> {
    return plaintext;
  }
  async unwrap(ciphertext: Bytes): Promise<Bytes> {
    return ciphertext;
  }
}
