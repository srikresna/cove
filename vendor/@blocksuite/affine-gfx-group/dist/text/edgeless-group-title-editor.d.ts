import type { GroupElementModel } from '@blocksuite/affine-model';
import type { RichText } from '@blocksuite/affine-rich-text';
import { type BlockComponent, type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
export declare function mountGroupTitleEditor(group: GroupElementModel, edgeless: BlockComponent): void;
declare const EdgelessGroupTitleEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessGroupTitleEditor extends EdgelessGroupTitleEditor_base {
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
    get inlineEditorContainer(): import("@blocksuite/std/inline").InlineRootElement<import("@blocksuite/affine-shared/types").AffineTextAttributes> | null | undefined;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    private _unmount;
    connectedCallback(): void;
    firstUpdated(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    accessor group: GroupElementModel;
    accessor std: BlockStdScope;
    accessor richText: RichText;
}
export {};
//# sourceMappingURL=edgeless-group-title-editor.d.ts.map