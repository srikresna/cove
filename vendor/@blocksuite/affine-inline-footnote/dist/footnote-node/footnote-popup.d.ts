import type { FootNote } from '@blocksuite/affine-model';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import type { BlockStdScope } from '@blocksuite/std';
import { LitElement } from 'lit';
import type { FootNotePopupClickHandler } from './footnote-config';
declare const FootNotePopup_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class FootNotePopup extends FootNotePopup_base {
    static styles: import("lit").CSSResult;
    private readonly _isLoading$;
    private readonly _linkPreview$;
    private readonly _prefixIcon$;
    private readonly _popupLabel$;
    private readonly _tooltip$;
    private readonly _onClick;
    private readonly _initLinkPreviewData;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    get imageProxyService(): ImageProxyService;
    accessor footnote: FootNote;
    accessor std: BlockStdScope;
    accessor abortController: AbortController;
    accessor onPopupClick: FootNotePopupClickHandler | (() => void);
    accessor updateFootnoteAttributes: (footnote: FootNote) => void;
}
export {};
//# sourceMappingURL=footnote-popup.d.ts.map