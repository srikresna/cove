import type { Bytes } from "@/services/vault/crypto";
import type { IDeviceBind } from "@/services/vault/IDeviceBind";

export class IdentityDeviceBind implements IDeviceBind {
  async wrap(plaintext: Bytes): Promise<Bytes> {
    return plaintext;
  }
  async unwrap(ciphertext: Bytes): Promise<Bytes> {
    return ciphertext;
  }
}
