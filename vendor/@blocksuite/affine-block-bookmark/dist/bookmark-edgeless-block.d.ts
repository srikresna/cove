import { type StyleInfo } from 'lit/directives/style-map.js';
import { BookmarkBlockComponent } from './bookmark-block.js';
declare const BookmarkEdgelessBlockComponent_base: typeof BookmarkBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class BookmarkEdgelessBlockComponent extends BookmarkEdgelessBlockComponent_base {
    selectedStyle$: null;
    blockDraggable: boolean;
    getRenderingRect(): {
        x: number;
        y: number;
        w: number;
        h: number;
        zIndex: string;
    };
    connectedCallback(): void;
    renderGfxBlock(): unknown;
    protected accessor blockContainerStyles: StyleInfo;
}
export declare const BookmarkBlockInteraction: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-bookmark': BookmarkEdgelessBlockComponent;
    }
}
export {};
//# sourceMappingURL=bookmark-edgeless-block.d.ts.map