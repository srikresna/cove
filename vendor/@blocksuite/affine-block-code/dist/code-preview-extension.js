import { createIdentifier } from '@blocksuite/global/di';
export const CodeBlockPreviewIdentifier = createIdentifier('CodeBlockPreview');
export function CodeBlockPreviewExtension(lang, renderer) {
    return {
        setup: di => {
            di.addImpl(CodeBlockPreviewIdentifier(lang), { renderer, lang });
        },
    };
}
