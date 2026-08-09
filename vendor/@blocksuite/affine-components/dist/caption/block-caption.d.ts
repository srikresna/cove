import type { DocMode } from '@blocksuite/affine-model';
import type { BlockStdScope } from '@blocksuite/std';
import { ShadowlessElement } from '@blocksuite/std';
import type { BlockModel, Store } from '@blocksuite/store';
import { nothing } from 'lit';
export interface BlockCaptionProps {
    caption: string | null | undefined;
}
declare const BlockCaptionEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class BlockCaptionEditor<Model extends BlockModel<BlockCaptionProps> = BlockModel<BlockCaptionProps>> extends BlockCaptionEditor_base {
    static styles: import("lit").CSSResult;
    private _focus;
    show: () => void;
    get mode(): DocMode;
    private _onCaptionKeydown;
    private _onInputBlur;
    private _onInputChange;
    private _onInputFocus;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor caption: string | null | undefined;
    accessor display: boolean;
    accessor doc: Store;
    accessor input: HTMLInputElement;
    accessor model: Model;
    accessor std: BlockStdScope;
}
declare global {
    interface HTMLElementTagNameMap {
        'block-caption-editor': BlockCaptionEditor;
    }
}
export {};
//# sourceMappingURL=block-caption.d.ts.map