import { NoteBlockModel } from '@blocksuite/affine-model';
import { calcDropTarget, getClosestBlockComponentByPoint, isInsidePageEditor, matchModels, } from '@blocksuite/affine-shared/utils';
import { createIdentifier } from '@blocksuite/global/di';
import { Point } from '@blocksuite/global/gfx';
import { LifeCycleWatcher, } from '@blocksuite/std';
import { SurfaceBlockModel } from '@blocksuite/std/gfx';
import { computed, signal } from '@preact/signals-core';
import throttle from 'lodash-es/throttle';
import { DropIndicator } from './drop-indicator';
/**
 * Handles resources from outside.
 * Uses `drag over` to handle it.
 */
export class FileDropExtension extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this.indicator = new DropIndicator();
        this.dragging$ = signal(false);
        this.point$ = signal(null);
        this._disableIndicator = false;
        this.closestElement$ = signal(null);
        this.dropTarget$ = computed(() => {
            let target = null;
            const element = this.closestElement$.value;
            if (!element)
                return target;
            const model = element.model;
            const parent = this.std.store.getParent(model);
            if (!matchModels(parent, [SurfaceBlockModel])) {
                const point = this.point$.value;
                target = point && calcDropTarget(point, model, element);
            }
            return target;
        });
        this.shouldIgnoreEvent = (event, shouldCheckFiles) => {
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer)
                return true;
            const effectAllowed = dataTransfer.effectAllowed;
            if (effectAllowed === 'none')
                return true;
            if (!shouldCheckFiles)
                return false;
            const droppedFiles = dataTransfer.files;
            if (!droppedFiles || !droppedFiles.length)
                return true;
            return false;
        };
        this.updatePoint = (event) => {
            const { clientX, clientY } = event;
            const oldPoint = this.point$.peek();
            if (oldPoint &&
                Math.round(oldPoint.x) === Math.round(clientX) &&
                Math.round(oldPoint.y) === Math.round(clientY))
                return;
            this.point$.value = new Point(clientX, clientY);
        };
        this.onDragLeave = () => {
            this.point$.value = null;
        };
        this.onDragOver = (event) => {
            event.preventDefault();
            if (this.shouldIgnoreEvent(event))
                return;
            this.updatePoint(event);
        };
        this.onDrop = (event) => {
            event.preventDefault();
            if (this.shouldIgnoreEvent(event, true))
                return;
            this.updatePoint(event);
        };
    }
    static { this.key = 'FileDropExtension'; }
    getDropTargetModel(model) {
        // Existed or In Edgeless
        if (model || !isInsidePageEditor(this.editorHost))
            return model;
        const rootModel = this.doc.root;
        if (!rootModel)
            return null;
        let lastNote = rootModel.children[rootModel.children.length - 1];
        if (!lastNote || !matchModels(lastNote, [NoteBlockModel])) {
            const newNoteId = this.doc.addBlock('affine:note', {}, rootModel.id);
            const newNote = this.doc.getBlock(newNoteId)?.model;
            if (!newNote)
                return null;
            lastNote = newNote;
        }
        const lastItem = lastNote.children[lastNote.children.length - 1];
        if (lastItem) {
            model = lastItem;
        }
        else {
            const newParagraphId = this.doc.addBlock('affine:paragraph', {}, lastNote, 0);
            model = this.doc.getBlock(newParagraphId)?.model ?? null;
        }
        return model;
    }
    get doc() {
        return this.std.store;
    }
    get editorHost() {
        return this.std.host;
    }
    unmounted() {
        super.unmounted();
        this.indicator.remove();
    }
    mounted() {
        super.mounted();
        const std = this.std;
        std.host.ownerDocument.body.append(this.indicator);
        std.event.disposables.add(this.point$.subscribe(throttle(value => {
            if (!value) {
                this.closestElement$.value = null;
                return;
            }
            const element = getClosestBlockComponentByPoint(value);
            if (!element) {
                return;
            }
            if (element === this.closestElement$.value) {
                return;
            }
            this.closestElement$.value = element;
        }, 144, { leading: true, trailing: true })));
        std.event.disposables.add(this.dropTarget$.subscribe(target => {
            this.indicator.rect = this._disableIndicator
                ? null
                : (target?.rect ?? null);
        }));
        std.event.disposables.add(std.event.add('nativeDragStart', () => {
            this.dragging$.value = true;
        }));
        std.event.disposables.add(std.event.add('nativeDragEnd', () => {
            this.dragging$.value = false;
        }));
        std.event.disposables.add(std.dnd.monitor({
            onDragStart: () => {
                this._disableIndicator = true;
            },
            onDrop: () => {
                this._disableIndicator = false;
            },
        }));
        std.event.disposables.add(std.event.add('nativeDragOver', context => {
            const event = context.get('dndState').raw;
            if (this.dragging$.peek()) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            this.onDragOver(event);
        }));
        std.event.disposables.add(std.event.add('nativeDragLeave', () => {
            this.onDragLeave();
        }));
        std.event.disposables.add(std.event.add('nativeDrop', context => {
            const event = context.get('dndState').raw;
            const { x, y, dataTransfer } = event;
            const droppedFiles = dataTransfer?.files;
            if (!droppedFiles || !droppedFiles.length) {
                this.onDragLeave();
                return;
            }
            this.onDrop(event);
            const target = this.dropTarget$.peek();
            const std = this.std;
            const targetModel = this.getDropTargetModel(target?.modelState.model ?? null);
            const placement = target?.placement === 'before' ? 'before' : 'after';
            const values = std.provider
                .getAll(FileDropConfigExtensionIdentifier)
                .values();
            for (const ext of values) {
                if (!ext.onDrop)
                    continue;
                const options = {
                    std,
                    files: [...droppedFiles],
                    targetModel,
                    placement,
                    point: [x, y],
                };
                if (ext.onDrop(options))
                    break;
            }
            this.onDragLeave();
        }));
    }
}
const FileDropConfigExtensionIdentifier = createIdentifier('FileDropConfigExtension');
export const FileDropConfigExtension = (options) => {
    const identifier = FileDropConfigExtensionIdentifier(options.flavour);
    return {
        setup: di => {
            di.addImpl(identifier, () => options);
        },
    };
};
