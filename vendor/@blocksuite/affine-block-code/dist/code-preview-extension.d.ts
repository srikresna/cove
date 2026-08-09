import type { CodeBlockModel } from '@blocksuite/affine-model';
import type { ExtensionType } from '@blocksuite/store';
import type { HTMLTemplateResult } from 'lit';
export type CodeBlockPreviewRenderer = (model: CodeBlockModel) => HTMLTemplateResult | null;
export type CodeBlockPreviewContext = {
    renderer: CodeBlockPreviewRenderer;
    lang: string;
};
export declare const CodeBlockPreviewIdentifier: import("@blocksuite/global/di").ServiceIdentifier<CodeBlockPreviewContext> & (<U extends CodeBlockPreviewContext = CodeBlockPreviewContext>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function CodeBlockPreviewExtension(lang: string, renderer: CodeBlockPreviewRenderer): ExtensionType;
//# sourceMappingURL=code-preview-extension.d.ts.map