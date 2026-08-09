import { ShadowlessElement } from '@blocksuite/std';
import type { SelectionController } from './selection-controller';
type Rect = {
    top: number;
    left: number;
    width: number;
    height: number;
};
export declare const SelectionLayerComponentName = "affine-table-selection-layer";
declare const SelectionLayer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SelectionLayer extends SelectionLayer_base {
    accessor selectionController: SelectionController;
    accessor getRowRect: (rowId: string) => Rect;
    accessor getColumnRect: (columnId: string) => Rect;
    accessor getAreaRect: (rowStartIndex: number, rowEndIndex: number, columnStartIndex: number, columnEndIndex: number) => Rect;
    selection$: import("@preact/signals-core").ReadonlySignal<{
        type: "area";
        rowStartIndex: number;
        rowEndIndex: number;
        columnStartIndex: number;
        columnEndIndex: number;
    } | {
        type: "row";
        rowId: string;
    } | {
        type: "column";
        columnId: string;
    } | undefined>;
    computeRect: () => Rect | undefined;
    rect$: import("@preact/signals-core").Signal<Rect | undefined>;
    private getSelectionStyle;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        [SelectionLayerComponentName]: SelectionLayer;
    }
}
export {};
//# sourceMappingURL=selection-layer.d.ts.map