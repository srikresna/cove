import { EdgelessLegacySlotIdentifier } from '@blocksuite/affine-block-surface';
import { Bound } from '@blocksuite/global/gfx';
import { blockComponentSymbol, GfxElementSymbol, toGfxBlockComponent, } from '@blocksuite/std';
export function toEdgelessEmbedBlock(block) {
    var _a, _b;
    return class extends toGfxBlockComponent(block) {
        constructor() {
            super(...arguments);
            this.selectedStyle$ = null;
            this[_a] = true;
            this.blockDraggable = false;
            this.embedContainerStyle = {};
            this[_b] = true;
            this.#blockContainerStyles_accessor_storage = undefined;
        }
        static { _a = blockComponentSymbol, _b = GfxElementSymbol; }
        get bound() {
            return Bound.deserialize(this.model.xywh);
        }
        _handleClick(_) {
            return;
        }
        get edgelessSlots() {
            return this.std.get(EdgelessLegacySlotIdentifier);
        }
        connectedCallback() {
            super.connectedCallback();
            this._disposables.add(this.edgelessSlots.elementResizeStart.subscribe(() => {
                this.isResizing$.value = true;
            }));
            this._disposables.add(this.edgelessSlots.elementResizeEnd.subscribe(() => {
                this.isResizing$.value = false;
            }));
        }
        renderGfxBlock() {
            const bound = Bound.deserialize(this.model.xywh);
            this.embedContainerStyle.width = `${bound.w}px`;
            this.embedContainerStyle.height = `${bound.h}px`;
            this.blockContainerStyles = {
                width: `${bound.w}px`,
            };
            return this.renderPageContent();
        }
        #blockContainerStyles_accessor_storage;
        get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
        set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
    };
}
