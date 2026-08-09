import { FrameBlockModel } from '@blocksuite/affine-model';
import type { RichText } from '@blocksuite/affine-rich-text';
import { type BlockComponent, ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
declare const EdgelessFrameTitleEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessFrameTitleEditor extends EdgelessFrameTitleEditor_base {
    static styles: import("lit").CSSResult;
    get editorHost(): import("@blocksuite/std").EditorHost;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null | undefined;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    private _unmount;
    connectedCallback(): void;
    firstUpdated(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor edgeless: BlockComponent;
    accessor frameModel: FrameBlockModel;
    accessor richText: RichText | null;
}
export {};
//# sourceMappingURL=edgeless-frame-title-editor.d.ts.map