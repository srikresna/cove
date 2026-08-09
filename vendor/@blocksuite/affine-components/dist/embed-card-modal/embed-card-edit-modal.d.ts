import type { AliasInfo, LinkableEmbedModel } from '@blocksuite/affine-model';
import { type BlockComponent, type BlockStdScope, type EditorHost } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EmbedCardEditModal_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EmbedCardEditModal extends EmbedCardEditModal_base {
    static styles: import("lit").CSSResult;
    private _blockComponent;
    private readonly _hide;
    private readonly _onKeydown;
    private readonly _onReset;
    private readonly _onSave;
    private readonly _updateDescription;
    private readonly _updateTitle;
    get isEmbedLinkedDocModel(): boolean;
    get isEmbedSyncedDocModel(): boolean;
    get isInternalEmbedModel(): boolean;
    get modelType(): 'linked' | 'synced' | null;
    get placeholders(): {
        title: string;
        description: string;
    };
    private _updateInfo;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor description$: import("@preact/signals-core").Signal<string>;
    accessor host: EditorHost;
    accessor model: LinkableEmbedModel;
    accessor originalDocInfo: AliasInfo | undefined;
    accessor onReset: ((std: BlockStdScope, component: BlockComponent) => void) | undefined;
    accessor onSave: ((std: BlockStdScope, component: BlockComponent, props: AliasInfo) => void) | undefined;
    accessor resetButtonDisabled$: import("@preact/signals-core").ReadonlySignal<boolean>;
    accessor saveButtonDisabled$: import("@preact/signals-core").ReadonlySignal<boolean>;
    accessor title$: import("@preact/signals-core").Signal<string>;
    accessor titleInput: HTMLInputElement;
    accessor viewType: string;
    accessor abortController: AbortController | undefined;
}
export declare function toggleEmbedCardEditModal(host: EditorHost, embedCardModel: LinkableEmbedModel, viewType: string, originalDocInfo?: AliasInfo, onReset?: (std: BlockStdScope, component: BlockComponent) => void, onSave?: (std: BlockStdScope, component: BlockComponent, props: AliasInfo) => void, abortController?: AbortController): void;
declare global {
    interface HTMLElementTagNameMap {
        'embed-card-edit-modal': EmbedCardEditModal;
    }
}
export {};
//# sourceMappingURL=embed-card-edit-modal.d.ts.map