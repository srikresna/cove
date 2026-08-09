import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { TemplateResult } from 'lit';
import { type GroupTrait } from '../../../core/group-by/trait.js';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import { type TableViewSelectionWithType } from '../selection.js';
import type { TableSingleView } from '../table-view-manager.js';
import { TableClipboardController } from './controller/clipboard.js';
import { TableDragController } from './controller/drag.js';
import { TableHotkeysController } from './controller/hotkeys.js';
import { TableSelectionController } from './controller/selection.js';
import type { TableGrid } from './types.js';
export declare class VirtualTableViewUILogic extends DataViewUILogicBase<TableSingleView, TableViewSelectionWithType> {
    ui$: import("@preact/signals-core").Signal<TableViewUI | undefined>;
    clipboardController: TableClipboardController;
    dragController: TableDragController;
    hotkeysController: TableHotkeysController;
    selectionController: TableSelectionController;
    virtualScroll$: import("@preact/signals-core").Signal<TableGrid | undefined>;
    yScrollContainer: HTMLElement | undefined;
    columns$: import("@preact/signals-core").ReadonlySignal<{
        id: string;
        width: number;
    }[]>;
    groupTrait$: import("@preact/signals-core").ReadonlySignal<GroupTrait | undefined>;
    groups$: import("@preact/signals-core").ReadonlySignal<{
        id: string;
        rows: string[];
    }[]>;
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string;
    focusFirstCell: () => void;
    showIndicator: (evt: MouseEvent) => boolean;
    hideIndicator: () => void;
    moveTo: (id: string, evt: MouseEvent) => void;
    onWheel: (event: WheelEvent) => void;
    renderAddGroup: (groupHelper: GroupTrait) => TemplateResult | undefined;
    initVirtualScroll(yScrollContainer: HTMLElement, ui: TableViewUI): void;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
}
export declare class TableViewUI extends DataViewUIBase<VirtualTableViewUILogic> {
    private renderTable;
    connectedCallback(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'dv-table-view-ui-virtual': TableViewUI;
    }
}
//# sourceMappingURL=table-view-ui-logic.d.ts.map