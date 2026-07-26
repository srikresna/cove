import type { Bytes } from "./crypto";

export interface IDeviceBind {
  wrap(plaintext: Bytes): Promise<Bytes>;
  unwrap(ciphertext: Bytes): Promise<Bytes>;
}
