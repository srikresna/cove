import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { TemplateResult } from 'lit';
import type { GroupTrait } from '../../../core/group-by/trait.js';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import type { TableViewSelectionWithType } from '../selection';
import type { TableSingleView } from '../table-view-manager.js';
export declare class MobileTableViewUILogic extends DataViewUILogicBase<TableSingleView, TableViewSelectionWithType> {
    ui$: import("@preact/signals-core").Signal<MobileTableViewUI | undefined>;
    private get readonly();
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string | undefined;
    focusFirstCell: () => void;
    showIndicator: (_evt: MouseEvent) => boolean;
    hideIndicator: () => void;
    moveTo: () => void;
    renderAddGroup: (groupHelper: GroupTrait) => TemplateResult | undefined;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
}
export declare class MobileTableViewUI extends DataViewUIBase<MobileTableViewUILogic> {
    connectedCallback(): void;
    private renderTable;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-data-view-table-ui': MobileTableViewUI;
    }
}
//# sourceMappingURL=table-view-ui-logic.d.ts.map