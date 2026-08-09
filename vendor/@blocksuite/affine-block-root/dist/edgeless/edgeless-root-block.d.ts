import { type SurfaceBlockComponent, type SurfaceBlockModel } from '@blocksuite/affine-block-surface';
import { type RootBlockModel } from '@blocksuite/affine-model';
import { FontLoaderService } from '@blocksuite/affine-shared/services';
import { BlockComponent, type UIEventHandler } from '@blocksuite/std';
import { type GfxViewportElement } from '@blocksuite/std/gfx';
import { EdgelessPageKeyboardManager } from './edgeless-keyboard.js';
import type { EdgelessRootService } from './edgeless-root-service.js';
export declare class EdgelessRootBlockComponent extends BlockComponent<RootBlockModel, EdgelessRootService> {
    static styles: import("lit").CSSResult;
    private readonly _refreshLayerViewport;
    private _resizeObserver;
    keyboardManager: EdgelessPageKeyboardManager | null;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get surfaceBlockModel(): SurfaceBlockModel;
    get viewportElement(): HTMLElement;
    get fontLoader(): FontLoaderService;
    private _initFontLoader;
    private _initLayerUpdateEffect;
    private _initPanEvent;
    private _initPinchEvent;
    private _initPixelRatioChangeEffect;
    private _initRemoteCursor;
    private _initResizeEffect;
    private _initSlotEffects;
    private _initViewport;
    private _initWheelEvent;
    bindHotKey(keymap: Record<string, UIEventHandler>, options?: {
        global?: boolean;
        flavour?: boolean;
    }): () => void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor backgroundElm: HTMLDivElement | null;
    accessor gfxViewportElm: GfxViewportElement;
    accessor mountElm: HTMLDivElement | null;
    accessor surface: SurfaceBlockComponent;
}
//# sourceMappingURL=edgeless-root-block.d.ts.map