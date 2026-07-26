import type { IDeviceBind } from "../../services/vault/IDeviceBind";
import type { Bytes } from "../../services/vault/crypto";

export class IdentityDeviceBind implements IDeviceBind {
  async wrap(plaintext: Bytes): Promise<Bytes> {
    return plaintext;
  }
  async unwrap(ciphertext: Bytes): Promise<Bytes> {
    return ciphertext;
  }
}
