export class EncryptionService {
  private static masterKey: CryptoKey | null = null

  private static async getOrGenerateMasterKey(): Promise<CryptoKey> {
    if (this.masterKey) return this.masterKey

    const sessionSalt = new Uint8Array([
      165, 148, 249, 255, 112, 166, 255, 151,
      112, 255, 214, 112, 233, 255, 112, 112,
      214, 255, 165, 148, 249, 229, 217, 242,
      255, 204, 167, 184, 242, 230, 255, 255
    ])

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      sessionSalt,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    this.masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: sessionSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )

    return this.masterKey
  }

  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = ''
    const len = bytes.byteLength
    const chunkSize = 0x8000
    for (let i = 0; i < len; i += chunkSize) {
      const sub = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, Array.from(sub))
    }
    return btoa(binary)
  }

  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  static async encryptPayload(plainText: string): Promise<string> {
    if (!plainText) return ''
    const key = await this.getOrGenerateMasterKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plainText)

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    )

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    return this.bytesToBase64(combined)
  }

  static async decryptPayload(encryptedBase64: string): Promise<string> {
    if (!encryptedBase64) return ''
    if (encryptedBase64.startsWith('[') || encryptedBase64.startsWith('<')) {
      return encryptedBase64
    }

    try {
      const combined = this.base64ToBytes(encryptedBase64)
      if (combined.length < 13) return encryptedBase64

      const iv = combined.subarray(0, 12)
      const ciphertext = combined.subarray(12)
      const key = await this.getOrGenerateMasterKey()

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
      )

      return new TextDecoder().decode(decryptedBuffer)
    } catch {
      return encryptedBase64
    }
  }
}
