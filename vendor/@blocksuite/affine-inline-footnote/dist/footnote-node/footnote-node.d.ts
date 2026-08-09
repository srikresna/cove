import type { FootNote } from '@blocksuite/affine-model';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert } from '@blocksuite/store';
import { nothing } from 'lit';
import type { FootNoteNodeConfigProvider } from './footnote-config';
declare const AffineFootnoteNode_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineFootnoteNode extends AffineFootnoteNode_base {
    static styles: import("lit").CSSResult;
    get customNodeRenderer(): ((footnote: FootNote, std: BlockStdScope) => import("lit-html").TemplateResult<1>) | undefined;
    get customPopupRenderer(): ((footnote: FootNote, std: BlockStdScope, abortController: AbortController) => import("lit-html").TemplateResult<1>) | undefined;
    get interactive(): boolean | undefined;
    get hidePopup(): boolean | undefined;
    get disableHoverEffect(): boolean | undefined;
    get onPopupClick(): import("./footnote-config").FootNotePopupClickHandler | undefined;
    get inlineEditor(): import("@blocksuite/std/inline").InlineEditor<AffineTextAttributes> | undefined;
    get selfInlineRange(): import("@blocksuite/std/inline").InlineRange | null | undefined;
    get footnote(): {
        label: string;
        reference: {
            type: "doc" | "attachment" | "url";
            url?: string | undefined;
            title?: string | undefined;
            description?: string | undefined;
            docId?: string | undefined;
            blobId?: string | undefined;
            fileName?: string | undefined;
            fileType?: string | undefined;
            favicon?: string | undefined;
        };
    } | null | undefined;
    get readonly(): boolean;
    get citationService(): import("@blocksuite/affine-shared/services").CitationViewService;
    onFootnoteClick: () => void;
    private readonly _handleDocReference;
    private readonly _handleUrlReference;
    private readonly _updateFootnoteAttributes;
    private readonly _FootNoteDefaultContent;
    private readonly _FootNotePopup;
    private readonly _whenHover;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor config: FootNoteNodeConfigProvider | undefined;
    accessor delta: DeltaInsert<AffineTextAttributes>;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=footnote-node.d.ts.map