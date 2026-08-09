import { NoteBlockModel } from '@blocksuite/affine-model';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
declare const EdgelessNoteBackground_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessNoteBackground extends EdgelessNoteBackground_base {
    readonly backgroundStyle$: import("@preact/signals-core").ReadonlySignal<{
        borderRadius: string;
        backgroundColor: string;
        borderWidth: string;
        borderStyle: string;
        boxShadow: string;
    }>;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get doc(): import("@blocksuite/store").Store;
    private _tryAddParagraph;
    private _handleClickAtBackground;
    private _renderHeader;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult | typeof nothing | undefined;
    accessor std: BlockStdScope;
    accessor editing: boolean;
    accessor note: NoteBlockModel;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-background': EdgelessNoteBackground;
    }
}
export {};
//# sourceMappingURL=edgeless-note-background.d.ts.map