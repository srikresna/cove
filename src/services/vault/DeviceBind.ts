import { invoke } from "@tauri-apps/api/core";
import type { IDeviceBind } from "./IDeviceBind";
import type { Bytes } from "./crypto";

export class DeviceBind implements IDeviceBind {
  async wrap(plaintext: Bytes): Promise<Bytes> {
    const result = await invoke<number[]>("device_wrap", { plaintext: Array.from(plaintext) });
    return new Uint8Array(result);
  }

  async unwrap(ciphertext: Bytes): Promise<Bytes> {
    const result = await invoke<number[]>("device_unwrap", { ciphertext: Array.from(ciphertext) });
    return new Uint8Array(result);
  }
}
