import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type TemplateResult } from 'lit';
import { type GroupTrait } from '../../../core/group-by/trait.js';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import type { KanbanSingleView } from '../kanban-view-manager.js';
import type { KanbanViewSelectionWithType } from '../selection.js';
import { KanbanClipboardController } from './controller/clipboard.js';
import { KanbanDragController } from './controller/drag.js';
import { KanbanHotkeysController } from './controller/hotkeys.js';
import { KanbanSelectionController } from './controller/selection.js';
export declare class KanbanViewUILogic extends DataViewUILogicBase<KanbanSingleView, KanbanViewSelectionWithType> {
    ui$: import("@preact/signals-core").Signal<KanbanViewUI | undefined>;
    clipboardController: KanbanClipboardController;
    dragController: KanbanDragController;
    hotkeysController: KanbanHotkeysController;
    selectionController: KanbanSelectionController;
    groupTrait$: import("@preact/signals-core").ReadonlySignal<GroupTrait | undefined>;
    groups$: import("@preact/signals-core").ReadonlySignal<import("../../../index.js").Group<unknown, unknown, Record<string, unknown>>[]>;
    private get readonly();
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string | undefined;
    focusFirstCell: () => void;
    showIndicator: (evt: MouseEvent) => boolean;
    hideIndicator: () => void;
    moveTo: (id: string, evt: MouseEvent) => void;
    onWheel: (event: WheelEvent) => void;
    renderAddGroup: (groupHelper: GroupTrait) => TemplateResult | undefined;
    scrollContainer$: import("@preact/signals-core").Signal<HTMLElement | undefined>;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
}
export declare class KanbanViewUI extends DataViewUIBase<KanbanViewUILogic> {
    readonly sortContext: import("../../../core/utils/wc-dnd/sort/sort-context.js").SortContext;
    private renderGroups;
    connectedCallback(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'dv-kanban-view-ui': KanbanViewUI;
    }
}
//# sourceMappingURL=kanban-view-ui-logic.d.ts.map