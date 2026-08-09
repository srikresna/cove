import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewCellLifeCycle } from '../../../core/property/index.js';
import type { Property } from '../../../core/view-manager/property.js';
import type { KanbanViewSelection } from '../selection';
import type { KanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const KanbanCell_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class KanbanCell extends KanbanCell_base {
    static styles: import("lit").CSSResult;
    private readonly _cell;
    selectCurrentCell: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    get selection(): import("./controller/selection.js").KanbanSelectionController;
    connectedCallback(): void;
    isSelected(selection: KanbanViewSelection): boolean | undefined;
    render(): import("lit-html").TemplateResult | undefined;
    renderIcon(): import("lit-html").TemplateResult | undefined;
    accessor cardId: string;
    accessor column: Property;
    accessor contentOnly: boolean;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    accessor groupKey: string;
    isFocus$: import("@preact/signals-core").Signal<boolean>;
    accessor kanbanViewLogic: KanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-kanban-cell': KanbanCell;
    }
}
export {};
//# sourceMappingURL=cell.d.ts.map