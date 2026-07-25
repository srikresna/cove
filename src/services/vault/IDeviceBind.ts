import type { Bytes } from "./crypto";

/**
 * Device-bound key wrapping (Windows DPAPI / future: Secure Enclave).
 * Wraps the raw DEK so the keychain backup is useless off the trusted device.
 * Abstracted for testability (tests use an identity fake — no OS API needed).
 */
export interface IDeviceBind {
  wrap(plaintext: Bytes): Promise<Bytes>;
  unwrap(ciphertext: Bytes): Promise<Bytes>;
}
