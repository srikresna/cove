import type { FileSnapshot } from './clipboard.js';
export declare const encode: (arraybuffer: ArrayBuffer) => string;
export declare const decode: (base64: string) => ArrayBuffer;
export declare function encodeClipboardBlobs(map: Map<string, Blob>, onError?: (message: string) => void): Promise<Record<string, FileSnapshot>>;
export declare function decodeClipboardBlobs(blobs: Record<string, FileSnapshot>, map: Map<string, Blob> | undefined): void;
//# sourceMappingURL=utils.d.ts.map