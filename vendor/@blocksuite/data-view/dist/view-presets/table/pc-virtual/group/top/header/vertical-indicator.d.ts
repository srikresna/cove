import { ShadowlessElement } from '@blocksuite/std';
import type { TableProperty } from '../../../../table-view-manager';
declare const TableVerticalIndicator_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableVerticalIndicator extends TableVerticalIndicator_base {
    static styles: import("lit").CSSResult;
    protected render(): unknown;
    accessor height: number;
    accessor left: number;
    accessor shadow: boolean;
    accessor top: number;
    accessor width: number;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-virtual-table-vertical-indicator': TableVerticalIndicator;
    }
}
export declare const getTableGroupRect: (ele: HTMLElement) => {
    top: number;
    bottom: number;
} | undefined;
export declare const startDragWidthAdjustmentBar: (evt: PointerEvent, ele: HTMLElement, width: number, column: TableProperty) => void;
type VerticalIndicator = {
    display: (left: number, top: number, height: number, width?: number, shadow?: boolean) => void;
    remove: () => void;
};
export declare const getVerticalIndicator: () => VerticalIndicator;
export {};
//# sourceMappingURL=vertical-indicator.d.ts.map