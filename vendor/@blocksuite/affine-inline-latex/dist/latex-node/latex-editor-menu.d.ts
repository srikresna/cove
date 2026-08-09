import type { RichText } from '@blocksuite/affine-rich-text';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import { type Signal } from '@preact/signals-core';
import { type ThemedToken } from 'shiki';
import * as Y from 'yjs';
export declare const LatexEditorInlineManagerExtension: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/std/inline").InlineManager<AffineTextAttributes>>;
};
declare const LatexEditorMenu_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class LatexEditorMenu extends LatexEditorMenu_base {
    static styles: import("lit").CSSResult;
    highlightTokens$: Signal<ThemedToken[][]>;
    yText: Y.Text;
    get inlineManager(): import("@blocksuite/std/inline").InlineManager<AffineTextAttributes>;
    get richText(): RichText | null;
    private readonly _getVerticalScrollContainer;
    private _updateHighlightTokens;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor abortController: AbortController;
    accessor latexSignal: Signal<string>;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=latex-editor-menu.d.ts.map