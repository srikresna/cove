import { type IModelCoord } from '@blocksuite/affine-block-surface';
import { TextElementModel } from '@blocksuite/affine-model';
import type { RichText } from '@blocksuite/affine-rich-text';
import { type BlockComponent, type BlockStdScope, type PointerEventState, ShadowlessElement } from '@blocksuite/std';
export declare function mountTextElementEditor(textElement: TextElementModel, edgeless: BlockComponent, focusCoord?: IModelCoord): void;
/**
 * @deprecated
 *
 * Canvas Text has been deprecated
 */
export declare function addText(edgeless: BlockComponent, event: PointerEventState): void;
declare const EdgelessTextEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessTextEditor extends EdgelessTextEditor_base {
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    static BORDER_WIDTH: number;
    static PADDING_HORIZONTAL: number;
    static PADDING_VERTICAL: number;
    static PLACEHOLDER_TEXT: string;
    static styles: import("lit").CSSResult;
    private _isComposition;
    private _keeping;
    private readonly _updateRect;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
    get inlineEditorContainer(): import("@blocksuite/std/inline").InlineRootElement<import("@blocksuite/affine-shared/types").AffineTextAttributes> | null | undefined;
    connectedCallback(): void;
    firstUpdated(): void;
    getContainerOffset(): string;
    getCoordsOnCenterAlign(rect: {
        w: number;
        h: number;
        r: number;
        x: number;
        y: number;
    }, w1: number, h1: number): {
        x: number;
        y: number;
    };
    getCoordsOnLeftAlign(rect: {
        w: number;
        h: number;
        r: number;
        x: number;
        y: number;
    }, w1: number, h1: number): {
        x: number;
        y: number;
    };
    getCoordsOnRightAlign(rect: {
        w: number;
        h: number;
        r: number;
        x: number;
        y: number;
    }, w1: number, h1: number): {
        x: number;
        y: number;
    };
    getUpdateComplete(): Promise<boolean>;
    getVisualPosition(element: TextElementModel): import("@blocksuite/global/gfx").IVec;
    render(): import("lit-html").TemplateResult<1>;
    setKeeping(keeping: boolean): void;
    accessor std: BlockStdScope;
    accessor element: TextElementModel;
    accessor richText: RichText;
}
export {};
//# sourceMappingURL=edgeless-text-editor.d.ts.map