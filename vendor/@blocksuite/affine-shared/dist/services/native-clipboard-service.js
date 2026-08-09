import { createIdentifier } from '@blocksuite/global/di';
export const NativeClipboardProvider = createIdentifier('NativeClipboardService');
export function NativeClipboardExtension(nativeClipboardProvider) {
    return {
        setup: di => {
            di.addImpl(NativeClipboardProvider, nativeClipboardProvider);
        },
    };
}
