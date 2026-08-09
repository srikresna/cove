import type { BlockStdScope } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const MobileZoomRuler_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
/**
 * Compact zoom indicator for narrow / mobile edgeless viewports.
 * Shows the live zoom percentage and a fit-to-screen action in a pill HUD
 * anchored to the bottom-left of the canvas.
 */
export declare class MobileZoomRuler extends MobileZoomRuler_base {
    static styles: import("lit").CSSResult;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get viewport(): import("@blocksuite/std/gfx").Viewport;
    get zoom(): number;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=mobile-zoom-ruler.d.ts.map