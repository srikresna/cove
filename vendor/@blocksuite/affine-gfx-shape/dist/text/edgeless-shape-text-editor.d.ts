import type { ShapeElementModel } from '@blocksuite/affine-model';
import type { RichText } from '@blocksuite/affine-rich-text';
import { type BlockComponent, type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
export declare function mountShapeTextEditor(shapeElement: {
    id: string;
} | null | undefined, edgeless: BlockComponent): void;
declare const EdgelessShapeTextEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessShapeTextEditor extends EdgelessShapeTextEditor_base {
    private _compositionUpdateRaf;
    private _keeping;
    private _lastXYWH;
    private _resizeObserver;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get inlineEditorContainer(): import("@blocksuite/std/inline").InlineRootElement<import("@blocksuite/affine-shared/types").AffineTextAttributes> | null | undefined;
    get isMindMapNode(): boolean;
    private _initMindmapKeyBindings;
    private _stashMindMapTree;
    private _unmount;
    private _scheduleElementWHUpdate;
    private _getInlineEditorContentRect;
    private _updateElementWH;
    connectedCallback(): void;
    firstUpdated(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    setKeeping(keeping: boolean): void;
    accessor element: ShapeElementModel;
    accessor std: BlockStdScope;
    accessor richText: RichText;
}
export {};
//# sourceMappingURL=edgeless-shape-text-editor.d.ts.map