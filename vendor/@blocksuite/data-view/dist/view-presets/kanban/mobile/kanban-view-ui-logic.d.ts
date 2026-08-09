import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { TemplateResult } from 'lit';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import type { KanbanSingleView } from '../kanban-view-manager.js';
import type { KanbanViewSelectionWithType } from '../selection';
export declare class MobileKanbanViewUILogic extends DataViewUILogicBase<KanbanSingleView, KanbanViewSelectionWithType> {
    ui$: import("@preact/signals-core").Signal<MobileKanbanViewUI | undefined>;
    private get readonly();
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string | undefined;
    focusFirstCell: () => void;
    showIndicator: (_evt: MouseEvent) => boolean;
    hideIndicator: () => void;
    moveTo: () => void;
    get groupManager(): import("../../../index.js").GroupTrait;
    renderAddGroup: () => TemplateResult | undefined;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
}
export declare class MobileKanbanViewUI extends DataViewUIBase<MobileKanbanViewUILogic> {
    connectedCallback(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-data-view-kanban-ui': MobileKanbanViewUI;
    }
}
//# sourceMappingURL=kanban-view-ui-logic.d.ts.map