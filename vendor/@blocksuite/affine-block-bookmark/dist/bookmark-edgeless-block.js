import { BookmarkBlockSchema } from '@blocksuite/affine-model';
import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH, } from '@blocksuite/affine-shared/consts';
import { toGfxBlockComponent } from '@blocksuite/std';
import { GfxViewInteractionExtension } from '@blocksuite/std/gfx';
import { styleMap } from 'lit/directives/style-map.js';
import { BookmarkBlockComponent } from './bookmark-block.js';
export class BookmarkEdgelessBlockComponent extends toGfxBlockComponent(BookmarkBlockComponent) {
    constructor() {
        super(...arguments);
        this.selectedStyle$ = null;
        this.blockDraggable = false;
        this.#blockContainerStyles_accessor_storage = {
            height: '100%',
        };
    }
    getRenderingRect() {
        const elementBound = this.model.elementBound;
        const style = this.model.props.style$.value;
        return {
            x: elementBound.x,
            y: elementBound.y,
            w: EMBED_CARD_WIDTH[style],
            h: EMBED_CARD_HEIGHT[style],
            zIndex: this.toZIndex(),
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.disposables.add(this.gfx.selection.slots.updated.subscribe(() => {
            this.requestUpdate();
        }));
    }
    renderGfxBlock() {
        const style = this.model.props.style$.value;
        const width = EMBED_CARD_WIDTH[style];
        const height = EMBED_CARD_HEIGHT[style];
        const bound = this.model.elementBound;
        const scaleX = bound.w / width;
        const scaleY = bound.h / height;
        const isSelected = this.gfx.selection.has(this.model.id);
        this.containerStyleMap = styleMap({
            width: `100%`,
            height: `100%`,
            transform: `scale(${scaleX}, ${scaleY})`,
            transformOrigin: '0 0',
            pointerEvents: isSelected ? 'auto' : 'none',
        });
        return this.renderPageContent();
    }
    #blockContainerStyles_accessor_storage;
    get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
    set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
}
export const BookmarkBlockInteraction = GfxViewInteractionExtension(BookmarkBlockSchema.model.flavour, {
    resizeConstraint: {
        lockRatio: true,
    },
    handleRotate: () => {
        return {
            beforeRotate(context) {
                context.set({
                    rotatable: false,
                });
            },
        };
    },
});
