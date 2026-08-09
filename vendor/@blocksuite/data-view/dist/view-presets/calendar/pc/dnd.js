import { getCalendarDateFromPoint } from './hit-test.js';
const isRecord = (value) => typeof value === 'object' && value !== null;
export const getCalendarDndEntity = (data) => {
    if (!isRecord(data)) {
        return;
    }
    const bsEntity = data.bsEntity;
    if (isRecord(bsEntity)) {
        if (bsEntity.type === 'calendar-entry' &&
            typeof bsEntity.entryId === 'string') {
            return {
                type: 'calendar-entry',
                entryId: bsEntity.entryId,
            };
        }
        if (bsEntity.type === 'doc' && typeof bsEntity.docId === 'string') {
            return {
                type: 'doc',
                docId: bsEntity.docId,
            };
        }
    }
    const entity = data.entity;
    if (isRecord(entity) &&
        entity.type === 'doc' &&
        typeof entity.id === 'string') {
        return {
            type: 'doc',
            docId: entity.id,
        };
    }
    return;
};
export class CalendarDnd {
    constructor(dnd, callbacks) {
        this.dnd = dnd;
        this.callbacks = callbacks;
        this.entryCleanups = new Map();
    }
    bindRoot(element) {
        if (!this.dnd || !(element instanceof HTMLElement)) {
            this.cleanupRoot();
            return;
        }
        if (this.rootCleanup?.element === element) {
            return;
        }
        this.cleanupRoot();
        const cleanup = this.dnd.dropTarget({
            element,
            getIsSticky: () => true,
            setDropData: ({ input }) => ({
                date: getCalendarDateFromPoint(element, input.clientX, input.clientY),
            }),
            canDrop: ({ source, input }) => {
                const entity = getCalendarDndEntity(source.data);
                const date = getCalendarDateFromPoint(element, input.clientX, input.clientY);
                return entity && date !== undefined
                    ? this.callbacks.canDrop(entity)
                    : false;
            },
            onDrag: ({ source, location }) => {
                this.updateDropTarget(element, source.data, location.current.input);
            },
            onDragEnter: ({ source, location }) => {
                this.updateDropTarget(element, source.data, location.current.input);
            },
            onDragLeave: () => {
                this.callbacks.onDropTargetChange(undefined);
            },
            onDrop: ({ source, location }) => {
                const entity = getCalendarDndEntity(source.data);
                const date = getCalendarDateFromPoint(element, location.current.input.clientX, location.current.input.clientY);
                if (entity && date !== undefined && this.callbacks.canDrop(entity)) {
                    this.callbacks.onDrop(entity, date);
                }
                this.callbacks.onDropTargetChange(undefined);
            },
        });
        this.rootCleanup = { element, cleanup };
    }
    bindEntry(key, entry, element, disabled = false) {
        if (!this.dnd ||
            !(element instanceof HTMLElement) ||
            entry.kind !== 'row' ||
            disabled) {
            this.cleanupEntry(key);
            if (element instanceof HTMLElement) {
                element.setAttribute('draggable', 'false');
            }
            return;
        }
        const current = this.entryCleanups.get(key);
        if (current?.element === element) {
            return;
        }
        this.cleanupEntry(key);
        const cleanup = this.dnd.draggable({
            element,
            canDrag: () => {
                const currentEntry = this.callbacks.getEntry(entry.id);
                return currentEntry?.kind === 'row'
                    ? this.callbacks.canDragEntry()
                    : false;
            },
            setDragData: () => ({
                type: 'calendar-entry',
                entryId: entry.id,
            }),
            setDragPreview: ({ container, setOffset }) => {
                const currentEntry = this.callbacks.getEntry(entry.id);
                const preview = document.createElement('div');
                preview.textContent = currentEntry?.title || 'Untitled';
                preview.style.cssText =
                    'padding:0 6px;height:22px;line-height:22px;border-radius:4px;' +
                        'font-size:12px;white-space:nowrap;overflow:hidden;' +
                        'background:var(--affine-hover-color,#f5f5f5);' +
                        'color:var(--affine-text-primary-color,#333);' +
                        'max-width:140px;text-overflow:ellipsis;pointer-events:none;';
                container.append(preview);
                setOffset({ x: 10, y: 11 });
            },
            onDragStart: () => {
                const currentEntry = this.callbacks.getEntry(entry.id);
                if (currentEntry?.kind === 'row') {
                    this.callbacks.onEntryDragStart(currentEntry);
                }
            },
            onDrop: () => {
                this.callbacks.onEntryDragEnd();
            },
        });
        this.entryCleanups.set(key, { element, cleanup });
    }
    cleanup() {
        this.cleanupRoot();
        for (const key of this.entryCleanups.keys()) {
            this.cleanupEntry(key);
        }
    }
    cleanupEntry(key) {
        this.entryCleanups.get(key)?.cleanup();
        this.entryCleanups.delete(key);
    }
    cleanupRoot() {
        this.rootCleanup?.cleanup();
        this.rootCleanup = undefined;
    }
    updateDropTarget(root, data, input) {
        const entity = getCalendarDndEntity(data);
        const date = getCalendarDateFromPoint(root, input.clientX, input.clientY);
        if (entity && date !== undefined && this.callbacks.canDrop(entity)) {
            this.callbacks.onDropTargetChange(date, entity);
        }
        else {
            this.callbacks.onDropTargetChange(undefined);
        }
    }
}
