import { type MenuConfig } from '@blocksuite/affine-components/context-menu';
import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type TemplateResult } from 'lit';
import { DataViewUIBase, DataViewUILogicBase } from '../../../core/view/data-view-base.js';
import type { CalendarSingleView } from '../calendar-view-manager.js';
import type { CalendarEntry, CalendarRowEntry } from '../types.js';
type CalendarInteractionState = {
    type: 'drag';
    entry: CalendarRowEntry;
    targetDay?: number;
} | {
    type: 'doc';
    docId: string;
    targetDay?: number;
} | {
    type: 'resize';
    entry: CalendarRowEntry;
    edge: 'start' | 'end';
    targetDay?: number;
};
export declare class CalendarViewUILogic extends DataViewUILogicBase<CalendarSingleView> {
    private ui?;
    private readonly dnd;
    selectedEntryId: string | undefined;
    interactionState: CalendarInteractionState | undefined;
    private suppressNextClick;
    private cleanupResize?;
    getPreviewRange(): {
        start: number;
        end: number;
    } | undefined;
    isDayInPreview(day: number): boolean;
    isEntryBeingMoved(entryId: string): boolean;
    currentMonth: number;
    clearSelection: () => void;
    addRow: (position: InsertToPosition) => string | undefined;
    focusFirstCell: () => void;
    onWheel: (event: WheelEvent) => void;
    showIndicator: () => boolean;
    hideIndicator: () => void;
    moveTo: () => void;
    renderer: import("@blocksuite/affine-shared/types").UniComponent<unknown, {}>;
    attach(ui: CalendarViewUI): void;
    detach(ui: CalendarViewUI): void;
    moveMonth(offset: number): void;
    goToday(): void;
    isCurrentMonth(): boolean;
    createRowOnDate(date: number): void;
    openSetupMenu(target: HTMLElement): void;
    private getWorkspaceCalendarConfig;
    private createSourceControlItems;
    openSourceMenu(target: HTMLElement): void;
    private getDatePropertyMenuItems;
    getViewOptionsSettingItems(navigateToSubPage: (title: string, getItems: () => MenuConfig[]) => void, goBack: () => void): MenuConfig[];
    openEntry(entry: CalendarEntry, target: HTMLElement): void;
    get isInteracting(): boolean;
    private setInteractionTarget;
    private endInteraction;
    bindCalendarDropTarget(element?: Element): void;
    bindEntryDraggable(key: string, entry: CalendarEntry, element?: Element): void;
    private canDropDndEntity;
    private dropDndEntity;
    startResize(entry: CalendarEntry, edge: 'start' | 'end', event: PointerEvent): void;
    private cleanupResizeInteraction;
    handleEntryClick(entry: CalendarEntry, target: HTMLElement): void;
    handleEntryKeydown(entry: CalendarEntry, event: KeyboardEvent): void;
    private loadExternalEntries;
}
export declare class CalendarViewUI extends DataViewUIBase<CalendarViewUILogic> {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private renderEntry;
    private renderEntryTitle;
    private getMovingEntryId;
    private renderDayPreview;
    private getSegmentPreviewLayout;
    private renderPreviewSpacer;
    private renderSegmentPreview;
    private renderEmptyMonthHint;
    private renderCalendar;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-calendar': CalendarViewUI;
    }
}
export {};
//# sourceMappingURL=view.d.ts.map