import { DefaultTool, EdgelessLegacySlotIdentifier, } from '@blocksuite/affine-block-surface';
import { on } from '@blocksuite/affine-shared/utils';
import { BaseTool, createRafCoalescer, MouseButton, } from '@blocksuite/std/gfx';
import { Signal } from '@preact/signals-core';
export class PanTool extends BaseTool {
    constructor() {
        super(...arguments);
        this._lastPoint = null;
        this._pendingDelta = [0, 0];
        this._deltaFlushCoalescer = createRafCoalescer(() => {
            this._flushPendingDelta();
        });
        this.panning$ = new Signal(false);
    }
    static { this.toolName = 'pan'; }
    _flushPendingDelta() {
        if (this._pendingDelta[0] === 0 && this._pendingDelta[1] === 0) {
            return;
        }
        const [deltaX, deltaY] = this._pendingDelta;
        this._pendingDelta = [0, 0];
        this.gfx.viewport.applyDeltaCenter(deltaX, deltaY);
    }
    get allowDragWithRightButton() {
        return true;
    }
    dragEnd(_) {
        this._deltaFlushCoalescer.flush();
        this._lastPoint = null;
        this.panning$.value = false;
    }
    dragMove(e) {
        if (!this._lastPoint)
            return;
        const { viewport } = this.gfx;
        const { zoom } = viewport;
        const [lastX, lastY] = this._lastPoint;
        const deltaX = lastX - e.x;
        const deltaY = lastY - e.y;
        this._lastPoint = [e.x, e.y];
        this._pendingDelta[0] += deltaX / zoom;
        this._pendingDelta[1] += deltaY / zoom;
        this._deltaFlushCoalescer.schedule(undefined);
    }
    dragStart(e) {
        this._lastPoint = [e.x, e.y];
        this._pendingDelta = [0, 0];
        this.panning$.value = true;
    }
    mounted() {
        this.addHook('pointerDown', evt => {
            const shouldPanWithMiddle = evt.raw.button === MouseButton.MIDDLE;
            if (!shouldPanWithMiddle) {
                return;
            }
            const currentTool = this.controller.currentToolOption$.peek();
            const { toolType, options: originalToolOptions } = currentTool;
            if (toolType?.toolName === PanTool.toolName) {
                return;
            }
            evt.raw.preventDefault();
            const selectionToRestore = this.gfx.selection.surfaceSelections.slice();
            const restoreToPrevious = () => {
                this.gfx.selection.set(selectionToRestore);
                if (!toolType)
                    return;
                // restore to DefaultTool if previous tool is CopilotTool
                if (toolType.toolName === 'copilot') {
                    this.controller.setTool(DefaultTool);
                    return;
                }
                let finalOptions = originalToolOptions;
                if (toolType.toolName === 'frameNavigator') {
                    // When restoring PresentTool (frameNavigator) after a temporary pan (e.g., via middle mouse button),
                    // set 'restoredAfterPan' to true. This allows PresentTool to avoid an unwanted viewport reset
                    // and maintain the panned position.
                    const currentPresentOptions = originalToolOptions;
                    finalOptions = {
                        ...currentPresentOptions,
                        restoredAfterPan: true,
                    };
                }
                this.controller.setTool(toolType, finalOptions);
            };
            // If in presentation mode, disable black background after middle mouse drag
            if (toolType?.toolName === 'frameNavigator') {
                const slots = this.std.get(EdgelessLegacySlotIdentifier);
                slots.navigatorSettingUpdated.next({
                    blackBackground: false,
                });
            }
            this.controller.setTool(PanTool, {
                panning: true,
            });
            const dispose = on(document, 'pointerup', evt => {
                if (evt.button === MouseButton.MIDDLE) {
                    restoreToPrevious();
                }
                dispose();
            });
            return false;
        });
    }
    unmounted() {
        this._deltaFlushCoalescer.cancel();
    }
}
