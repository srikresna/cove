import type { EditorHost } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
declare const EmbedCardCreateModal_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EmbedCardCreateModal extends EmbedCardCreateModal_base {
    static styles: import("lit").CSSResult;
    private readonly _onCancel;
    private readonly _onConfirm;
    private readonly _onDocumentKeydown;
    private _handleInput;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _linkInputValue;
    accessor createOptions: {
        mode: 'page';
        parentModel: BlockModel | string;
        index?: number;
    } | {
        mode: 'edgeless';
        onSave: (url: string) => void;
    };
    accessor descriptionText: string;
    accessor host: EditorHost;
    accessor input: HTMLInputElement;
    accessor onConfirm: (options: {
        mode: 'edgeless' | 'page';
    }) => void;
    accessor titleText: string;
}
export declare function toggleEmbedCardCreateModal(host: EditorHost, titleText: string, descriptionText: string, createOptions: {
    mode: 'page';
    parentModel: BlockModel | string;
    index?: number;
} | {
    mode: 'edgeless';
    onSave: (url: string) => void;
}, onConfirm: (options: {
    mode: 'page' | 'edgeless';
}) => void): Promise<void>;
declare global {
    interface HTMLElementTagNameMap {
        'embed-card-create-modal': EmbedCardCreateModal;
    }
}
export {};
//# sourceMappingURL=embed-card-create-modal.d.ts.map