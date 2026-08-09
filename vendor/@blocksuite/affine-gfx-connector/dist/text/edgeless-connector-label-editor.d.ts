import type { ConnectorElementModel } from '@blocksuite/affine-model';
import type { RichText } from '@blocksuite/affine-rich-text';
import { type IVec } from '@blocksuite/global/gfx';
import { type BlockComponent, type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
export declare function mountConnectorLabelEditor(connector: ConnectorElementModel, edgeless: BlockComponent, point?: IVec): void;
declare const EdgelessConnectorLabelEditor_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessConnectorLabelEditor extends EdgelessConnectorLabelEditor_base {
    static styles: import("lit").CSSResult;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    private _isComposition;
    private _keeping;
    private _resizeObserver;
    private readonly _updateLabelRect;
    get inlineEditor(): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
    get inlineEditorContainer(): import("@blocksuite/std/inline").InlineRootElement<import("@blocksuite/affine-shared/types").AffineTextAttributes> | null | undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    getUpdateComplete(): Promise<boolean>;
    render(): import("lit-html").TemplateResult<1>;
    setKeeping(keeping: boolean): void;
    accessor connector: ConnectorElementModel;
    accessor std: BlockStdScope;
    accessor richText: RichText;
}
export {};
//# sourceMappingURL=edgeless-connector-label-editor.d.ts.map