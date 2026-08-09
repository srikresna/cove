import type { NoteBlockModel } from '@blocksuite/affine-model';
import { type EditorHost, ShadowlessElement } from '@blocksuite/std';
declare const EdgelessNoteMask_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessNoteMask extends EdgelessNoteMask_base {
    protected firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor disableMask: boolean;
    accessor editing: boolean;
    accessor host: EditorHost;
    accessor model: NoteBlockModel;
    accessor zoom: number;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-mask': EdgelessNoteMask;
    }
}
export {};
//# sourceMappingURL=edgeless-note-mask.d.ts.map