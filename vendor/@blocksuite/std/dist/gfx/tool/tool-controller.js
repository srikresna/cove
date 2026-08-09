import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { computed, Signal } from '@preact/signals-core';
import { Subject } from 'rxjs';
import { GfxExtension, GfxExtensionIdentifier } from '../extension.js';
import { ToolIdentifier, } from './tool.js';
const supportedEvents = [
    'dragStart',
    'dragEnd',
    'dragMove',
    'pointerMove',
    'contextMenu',
    'pointerDown',
    'pointerUp',
    'click',
    'doubleClick',
    'tripleClick',
    'pointerOut',
];
export var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["FIFTH"] = 4] = "FIFTH";
    MouseButton[MouseButton["FOURTH"] = 3] = "FOURTH";
    MouseButton[MouseButton["MAIN"] = 0] = "MAIN";
    MouseButton[MouseButton["MIDDLE"] = 1] = "MIDDLE";
    MouseButton[MouseButton["SECONDARY"] = 2] = "SECONDARY";
})(MouseButton || (MouseButton = {}));
export class ToolController extends GfxExtension {
    constructor() {
        super(...arguments);
        this._builtInHookSlot = new Subject();
        this._disposableGroup = new DisposableGroup();
        this._toolOption$ = new Signal({});
        this._tools = new Map();
        this.currentToolName$ = new Signal();
        this.dragging$ = new Signal(false);
        /**
         * The dragging area in browser coordinates space.
         *
         * This is similar to `draggingViewArea$`, but if the viewport is changed during dragging,
         * it will be reflected in this area.
         */
        this.draggingViewportArea$ = computed(() => {
            const compute = (modelArea) => {
                const [viewStartX, viewStartY] = this.gfx.viewport.toViewCoord(modelArea.x, modelArea.y);
                const [viewEndX, viewEndY] = this.gfx.viewport.toViewCoord(modelArea.x + modelArea.w, modelArea.y + modelArea.h);
                return {
                    startX: viewStartX,
                    startY: viewStartY,
                    endX: viewEndX,
                    endY: viewEndY,
                    x: Math.min(viewStartX, viewEndX),
                    y: Math.min(viewStartY, viewEndY),
                    w: Math.abs(viewStartX - viewEndX),
                    h: Math.abs(viewStartY - viewEndY),
                };
            };
            return compute(this.draggingArea$.value);
        });
        /**
         * The dragging area in browser coordinates space.
         */
        this.draggingViewArea$ = new Signal({
            startX: 0,
            startY: 0,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            endX: 0,
            endY: 0,
        });
        /**
         * The last mouse move position in browser coordinates space.
         */
        this.lastMouseViewPos$ = new Signal({
            x: 0,
            y: 0,
        });
        /**
         * The last mouse position in model coordinates space.
         */
        this.lastMousePos$ = computed(() => {
            const [x, y] = this.gfx.viewport.toModelCoord(this.lastMouseViewPos$.value.x, this.lastMouseViewPos$.value.y);
            return {
                x,
                y,
            };
        });
        /**
         * The area that is being dragged.
         * The coordinates are in model space.
         */
        this.draggingArea$ = new Signal({
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
        });
        this.get = (type) => {
            const instance = this._tools.get(type.toolName);
            if (!instance) {
                throw new BlockSuiteError(BlockSuiteError.ErrorCode.ValueNotExists, `Trying to get tool "${type.toolName}" is not registered`);
            }
            return instance;
        };
        this.setTool = (toolType, options) => {
            const toolNameStr = toolType.toolName;
            const beforeUpdateCtx = this._createBuiltInHookCtx('beforeToolUpdate', {
                toolName: toolNameStr,
            });
            this._builtInHookSlot.next(beforeUpdateCtx.slotCtx);
            if (beforeUpdateCtx.prevented) {
                return;
            }
            // explicitly clear the selection when switching tools
            this.gfx.selection.set({ elements: [] });
            this.currentTool$.peek()?.deactivate();
            this.currentToolName$.value = toolNameStr;
            const currentTool = this.currentTool$.peek();
            if (!currentTool) {
                throw new BlockSuiteError(ErrorCode.ValueNotExists, `Tool "${this.currentToolName$.value}" is not defined`);
            }
            currentTool.activatedOption = options ?? {};
            this._toolOption$.value = {
                toolType,
                options: currentTool.activatedOption,
            };
            currentTool.activate(currentTool.activatedOption);
            const afterUpdateCtx = this._createBuiltInHookCtx('toolUpdate', {
                toolName: toolNameStr,
            });
            this._builtInHookSlot.next(afterUpdateCtx.slotCtx);
        };
    }
    static { this.key = 'ToolController'; }
    get currentTool$() {
        // oxlint-disable-next-line typescript/no-this-alias
        const self = this;
        return {
            get value() {
                return self._tools.get(self.currentToolName$.value);
            },
            peek() {
                return self._tools.get(self.currentToolName$.peek());
            },
        };
    }
    get currentToolOption$() {
        // oxlint-disable-next-line typescript/no-this-alias
        const self = this;
        return {
            peek() {
                return self._toolOption$.peek();
            },
            get value() {
                return self._toolOption$.value;
            },
        };
    }
    static extendGfx(gfx) {
        Object.defineProperty(gfx, 'tool', {
            get() {
                return this.std.provider.get(ToolControllerIdentifier);
            },
        });
    }
    _createBuiltInHookCtx(eventName, data) {
        const ctx = {
            prevented: false,
            slotCtx: {
                event: eventName,
                data,
                preventDefault() {
                    ctx.prevented = true;
                },
            },
        };
        return ctx;
    }
    _initializeEvents() {
        const hooks = {};
        /**
         * Invoke the hook and the tool handler.
         * @returns false if the handler is prevented by the hook
         */
        const invokeToolHandler = (evtName, evt, tool) => {
            const evtHooks = hooks[evtName];
            const stopHandler = evtHooks?.reduce((pre, hook) => {
                return pre || hook(evt) === false;
            }, false);
            tool = tool ?? this.currentTool$.peek();
            if (stopHandler) {
                return false;
            }
            try {
                tool?.[evtName](evt);
                return true;
            }
            catch (e) {
                throw new BlockSuiteError(ErrorCode.ExecutionError, `Error occurred while executing ${evtName} handler of tool "${tool?.toolName}"`, {
                    cause: e,
                });
            }
        };
        /**
         * Hook into the event lifecycle.
         * All hooks will be executed despite the current active tool.
         * This is useful for tools that need to perform some action before an event is handled.
         * @param evtName
         * @param handler
         */
        const addHook = (evtName, handler) => {
            hooks[evtName] = hooks[evtName] ?? [];
            hooks[evtName].push(handler);
            return () => {
                const idx = hooks[evtName].indexOf(handler);
                if (idx !== -1) {
                    hooks[evtName].splice(idx, 1);
                }
            };
        };
        let dragContext = null;
        let viewportSub = null;
        this._disposableGroup.add(this.std.event.add('dragStart', ctx => {
            const evt = ctx.get('pointerState');
            if (evt.button === MouseButton.SECONDARY &&
                !this.currentTool$.peek()?.allowDragWithRightButton) {
                return;
            }
            if (evt.button === MouseButton.MIDDLE) {
                evt.raw.preventDefault();
            }
            const [modelX, modelY] = this.gfx.viewport.toModelCoord(evt.x, evt.y);
            this.dragging$.value = true;
            this.draggingViewArea$.value = {
                startX: evt.x,
                startY: evt.y,
                endX: evt.x,
                endY: evt.y,
                x: evt.x,
                y: evt.y,
                w: 0,
                h: 0,
            };
            this.draggingArea$.value = {
                startX: modelX,
                startY: modelY,
                endX: modelX,
                endY: modelY,
                x: modelX,
                y: modelY,
                w: 0,
                h: 0,
            };
            this.lastMouseViewPos$.value = {
                x: evt.x,
                y: evt.y,
            };
            viewportSub?.unsubscribe();
            viewportSub = this.gfx.viewport.viewportUpdated.subscribe(() => {
                const lastPost = this.lastMouseViewPos$.peek();
                const [modelX, modelY] = this.gfx.viewport.toModelCoord(lastPost.x, lastPost.y);
                const original = this.draggingArea$.peek();
                this.draggingArea$.value = {
                    ...this.draggingArea$.peek(),
                    x: Math.min(modelX, original.startX),
                    y: Math.min(modelY, original.startY),
                    w: Math.abs(modelX - original.startX),
                    h: Math.abs(modelY - original.startY),
                    endX: modelX,
                    endY: modelY,
                };
            });
            // this means the dragEnd event is not even fired
            // so we need to manually call the dragEnd method
            if (dragContext?.tool) {
                dragContext.tool.dragEnd(evt);
                dragContext = null;
            }
            if (invokeToolHandler('dragStart', evt)) {
                dragContext = this.currentTool$.peek()
                    ? {
                        tool: this.currentTool$.peek(),
                    }
                    : null;
            }
        }));
        this._disposableGroup.add(this.std.event.add('dragMove', ctx => {
            if (!this.dragging$.peek()) {
                return;
            }
            const evt = ctx.get('pointerState');
            const draggingStart = {
                x: this.draggingArea$.peek().startX,
                y: this.draggingArea$.peek().startY,
                originX: this.draggingViewArea$.peek().startX,
                originY: this.draggingViewArea$.peek().startY,
            };
            const [modelX, modelY] = this.gfx.viewport.toModelCoord(evt.x, evt.y);
            this.draggingViewArea$.value = {
                ...this.draggingViewArea$.peek(),
                w: Math.abs(evt.x - draggingStart.originX),
                h: Math.abs(evt.y - draggingStart.originY),
                x: Math.min(evt.x, draggingStart.originX),
                y: Math.min(evt.y, draggingStart.originY),
                endX: evt.x,
                endY: evt.y,
            };
            this.draggingArea$.value = {
                ...this.draggingArea$.peek(),
                w: Math.abs(modelX - draggingStart.x),
                h: Math.abs(modelY - draggingStart.y),
                x: Math.min(modelX, draggingStart.x),
                y: Math.min(modelY, draggingStart.y),
                endX: modelX,
                endY: modelY,
            };
            this.lastMouseViewPos$.value = {
                x: evt.x,
                y: evt.y,
            };
            invokeToolHandler('dragMove', evt, dragContext?.tool);
        }));
        this._disposableGroup.add(this.std.event.add('dragEnd', ctx => {
            if (!this.dragging$.peek()) {
                return;
            }
            this.dragging$.value = false;
            const evt = ctx.get('pointerState');
            // if the tool dragEnd is prevented by the hook, call the dragEnd method manually
            // this guarantee the dragStart and dragEnd events are always called together
            if (!invokeToolHandler('dragEnd', evt, dragContext?.tool) &&
                dragContext?.tool) {
                dragContext.tool.dragEnd(evt);
            }
            viewportSub?.unsubscribe();
            viewportSub = null;
            dragContext = null;
            this.draggingViewArea$.value = {
                x: 0,
                y: 0,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                w: 0,
                h: 0,
            };
            this.draggingArea$.value = {
                x: 0,
                y: 0,
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                w: 0,
                h: 0,
            };
        }));
        this._disposableGroup.add(this.std.event.add('pointerMove', ctx => {
            const evt = ctx.get('pointerState');
            this.lastMouseViewPos$.value = {
                x: evt.x,
                y: evt.y,
            };
            invokeToolHandler('pointerMove', evt);
        }));
        this._disposableGroup.add(this.std.event.add('contextMenu', ctx => {
            const evt = ctx.get('defaultState');
            // when in editing mode, allow context menu to pop up
            if (this.gfx.selection.editing)
                return;
            evt.event.preventDefault();
        }));
        supportedEvents.slice(5).forEach(evtName => {
            this._disposableGroup.add(this.std.event.add(evtName, ctx => {
                const evt = ctx.get('pointerState');
                invokeToolHandler(evtName, evt);
            }));
        });
        this._builtInHookSlot.subscribe(evt => {
            hooks[evt.event]?.forEach(hook => hook(evt));
        });
        return {
            addHook,
        };
    }
    _register(tools) {
        if (this._tools.has(tools.toolName)) {
            this._tools.get(tools.toolName)?.unmounted();
        }
        this._tools.set(tools.toolName, tools);
        tools.mounted();
    }
    mounted() {
        const { addHook } = this._initializeEvents();
        const eventTarget = {
            addHook,
        };
        this.std.provider.getAll(ToolIdentifier).forEach(tool => {
            // @ts-expect-error ignore
            tool['eventTarget'] = eventTarget;
            this._register(tool);
        });
    }
    unmounted() {
        this.currentTool$.peek()?.deactivate();
        this._tools.forEach(tool => {
            tool.unmounted();
            tool['disposable'].dispose();
        });
        this._builtInHookSlot.complete();
    }
}
export const ToolControllerIdentifier = GfxExtensionIdentifier('ToolController');
