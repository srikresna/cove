import type { UIEventStateContext } from '@blocksuite/std';
import type { ReactiveController } from 'lit';
import { type TableAreaSelection, TableSelectionData } from './selection-schema';
import type { TableBlockComponent } from './table-block';
export declare class SelectionController implements ReactiveController {
    readonly host: TableBlockComponent;
    constructor(host: TableBlockComponent);
    hostConnected(): void;
    private get dataManager();
    private get clipboard();
    private get scale();
    widthAdjust(dragHandle: HTMLElement, event: MouseEvent): void;
    dragListener(): void;
    startColumnDrag(x: number, columnDragHandle: HTMLElement): {
        onMove: (x: number) => void;
        onEnd: () => void;
    } | undefined;
    columnDrag(columnDragHandle: HTMLElement, event: MouseEvent): void;
    startRowDrag(y: number, rowDragHandle: HTMLElement): {
        onMove: (y: number) => void;
        onEnd: () => void;
    } | undefined;
    rowDrag(rowDragHandle: HTMLElement, event: MouseEvent): void;
    readonly doCopyOrCut: (selection: TableAreaSelection, isCut: boolean) => void;
    onCopy: () => boolean;
    onCut: () => boolean;
    doPaste: (plainText: string, selection: TableAreaSelection) => void;
    onPaste: (_context: UIEventStateContext) => boolean;
    onDragStart(event: MouseEvent): void;
    setSelected(selection: TableSelectionData | undefined, removeNativeSelection?: boolean): void;
    selected$: import("@preact/signals-core").ReadonlySignal<{
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
    getSelected(): TableSelectionData | undefined;
    private hasExternalNativeSelection;
}
//# sourceMappingURL=selection-controller.d.ts.map