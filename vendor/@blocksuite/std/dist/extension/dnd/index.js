import { draggable, dropTargetForElements, monitorForElements, } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { centerUnderPointer } from '@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer';
import { disableNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { attachClosestEdge, extractClosestEdge, } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { LifeCycleWatcherIdentifier } from '../../identifier.js';
import { LifeCycleWatcher } from '../lifecycle-watcher.js';
export const DndExtensionIdentifier = LifeCycleWatcherIdentifier('DndController');
export class DndController extends LifeCycleWatcher {
    static { this.key = 'DndController'; }
    /**
     * Make an element draggable.
     */
    draggable(args) {
        const { setDragData, setExternalDragData, setDragPreview, element, dragHandle, ...rest } = args;
        return draggable({
            ...rest,
            element,
            dragHandle,
            onGenerateDragPreview: options => {
                if (setDragPreview) {
                    let state;
                    const setOffset = (offset) => {
                        if (offset === 'center') {
                            state = centerUnderPointer;
                        }
                        else if (offset === 'preserve') {
                            state = preserveOffsetOnSource({
                                element: options.source.element,
                                input: options.location.current.input,
                            });
                        }
                        else if (typeof offset === 'object') {
                            if (offset.x < 0 ||
                                offset.y < 0 ||
                                typeof offset.x === 'string' ||
                                typeof offset.y === 'string') {
                                state = pointerOutsideOfPreview({
                                    x: typeof offset.x === 'number'
                                        ? `${Math.abs(offset.x)}px`
                                        : offset.x,
                                    y: typeof offset.y === 'number'
                                        ? `${Math.abs(offset.y)}px`
                                        : offset.y,
                                });
                            }
                            state = offset;
                        }
                    };
                    setCustomNativeDragPreview({
                        getOffset: (...args) => {
                            if (!state) {
                                setOffset('center');
                            }
                            if (typeof state === 'function') {
                                return state(...args);
                            }
                            return state;
                        },
                        render: renderOption => {
                            setDragPreview({
                                setOffset,
                                ...options,
                                ...renderOption,
                            });
                        },
                        nativeSetDragImage: options.nativeSetDragImage,
                    });
                }
                else if (setDragPreview === false) {
                    disableNativeDragPreview({
                        nativeSetDragImage: options.nativeSetDragImage,
                    });
                }
            },
            getInitialData: options => {
                const bsEntity = setDragData?.(options) ?? {};
                return {
                    bsEntity,
                    from: {
                        at: 'blocksuite-editor',
                        docId: this.std.store.doc.id,
                    },
                };
            },
            getInitialDataForExternal: setExternalDragData
                ? options => {
                    return setExternalDragData?.(options);
                }
                : undefined,
        });
    }
    /**
     * Make an element a drop target.
     */
    dropTarget(args) {
        const { element, setDropData, allowDropPosition = ['bottom', 'left', 'top', 'right'], ...rest } = args;
        return dropTargetForElements({
            element,
            getData: options => {
                const data = setDropData?.(options) ?? {};
                const edge = extractClosestEdge(attachClosestEdge(data, {
                    element: options.element,
                    input: options.input,
                    allowedEdges: allowDropPosition,
                }));
                return edge
                    ? {
                        ...data,
                        edge,
                    }
                    : data;
            },
            ...rest,
        });
    }
    monitor(args) {
        return monitorForElements(args);
    }
    autoScroll(options) {
        return autoScrollForElements(options);
    }
}
