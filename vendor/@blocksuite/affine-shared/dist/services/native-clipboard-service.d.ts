import type { ExtensionType } from '@blocksuite/store';
/**
 * Copies the image as PNG in Electron.
 */
export interface NativeClipboardService {
    copyAsPNG(arrayBuffer: ArrayBuffer): Promise<boolean>;
}
export declare const NativeClipboardProvider: import("@blocksuite/global/di").ServiceIdentifier<NativeClipboardService> & (<U extends NativeClipboardService = NativeClipboardService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function NativeClipboardExtension(nativeClipboardProvider: NativeClipboardService): ExtensionType;
//# sourceMappingURL=native-clipboard-service.d.ts.map