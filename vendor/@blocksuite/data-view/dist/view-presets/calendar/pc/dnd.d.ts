import type { DndController } from '@blocksuite/std';
import type { CalendarEntry, CalendarRowEntry } from '../types.js';
export type CalendarDndEntity = {
    type: 'calendar-entry';
    entryId: string;
} | {
    type: 'doc';
    docId: string;
};
export declare const getCalendarDndEntity: (data: unknown) => CalendarDndEntity | undefined;
export type CalendarDndCallbacks = {
    getEntry: (entryId: string) => CalendarEntry | undefined;
    canDragEntry: () => boolean;
    canDrop: (entity: CalendarDndEntity) => boolean;
    onEntryDragStart: (entry: CalendarRowEntry) => void;
    onEntryDragEnd: () => void;
    onDropTargetChange: (date: number | undefined, entity?: CalendarDndEntity) => void;
    onDrop: (entity: CalendarDndEntity, date: number) => void;
};
export declare class CalendarDnd {
    private readonly dnd;
    private readonly callbacks;
    private readonly entryCleanups;
    private rootCleanup?;
    constructor(dnd: DndController | undefined, callbacks: CalendarDndCallbacks);
    bindRoot(element?: Element): void;
    bindEntry(key: string, entry: CalendarEntry, element?: Element, disabled?: boolean): void;
    cleanup(): void;
    private cleanupEntry;
    private cleanupRoot;
    private updateDropTarget;
}
//# sourceMappingURL=dnd.d.ts.map