import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
export declare const AFFINE_VIEWPORT_OVERLAY_WIDGET = "affine-viewport-overlay-widget";
export declare class AffineViewportOverlayWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    lock(): void;
    render(): import("lit-html").TemplateResult<1>;
    toggleLock(): void;
    unlock(): void;
    private accessor _lockViewport;
}
export declare const viewportOverlayWidget: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_VIEWPORT_OVERLAY_WIDGET]: AffineViewportOverlayWidget;
    }
}
//# sourceMappingURL=index.d.ts.map