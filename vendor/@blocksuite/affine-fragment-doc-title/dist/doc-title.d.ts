import { ShadowlessElement } from '@blocksuite/std';
import type { Store } from '@blocksuite/store';
declare const DocTitle_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DocTitle extends DocTitle_base {
    static styles: import("lit").CSSResult;
    private _getOrCreateFirstPageVisibleNote;
    private readonly _onTitleKeyDown;
    private readonly _updateTitleInMeta;
    private get _std();
    private get _rootModel();
    private get _viewport();
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
    get inlineEditorContainer(): HTMLDivElement;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _isComposing;
    private accessor _isReadonly;
    private accessor _richTextElement;
    accessor doc: Store;
    accessor wrapText: boolean;
}
export {};
//# sourceMappingURL=doc-title.d.ts.map