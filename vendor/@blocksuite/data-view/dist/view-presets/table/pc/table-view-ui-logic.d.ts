import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { TemplateResult } from 'lit';
import type { GroupTrait } from '../../../core/group-by/trait.js';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import type { TableViewSelectionWithType } from '../selection';
import type { TableSingleView } from '../table-view-manager.js';
import { TableClipboardController } from './controller/clipboard.js';
import { TableDragController } from './controller/drag.js';
import { TableHotkeysController } from './controller/hotkeys.js';
import { TableSelectionController } from './controller/selection.js';
export declare class TableViewUILogic extends DataViewUILogicBase<TableSingleView, TableViewSelectionWithType> {
    ui$: import("@preact/signals-core").Signal<TableViewUI | undefined>;
    scrollContainer$: import("@preact/signals-core").Signal<HTMLDivElement | undefined>;
    tableContainer$: import("@preact/signals-core").Signal<HTMLDivElement | undefined>;
    clipboardController: TableClipboardController;
    dragController: TableDragController;
    hotkeysController: TableHotkeysController;
    selectionController: TableSelectionController;
    private get readonly();
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string | undefined;
    focusFirstCell: () => void;
    showIndicator: (evt: MouseEvent) => boolean;
    hideIndicator: () => void;
    moveTo: (id: string, evt: MouseEvent) => void;
    onWheel: (event: WheelEvent) => void;
    renderAddGroup: (groupHelper: GroupTrait) => TemplateResult | undefined;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
}
export declare class TableViewUI extends DataViewUIBase<TableViewUILogic> {
    connectedCallback(): void;
    private renderTable;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'dv-table-view-ui': TableViewUI;
    }
}
//# sourceMappingURL=table-view-ui-logic.d.ts.map