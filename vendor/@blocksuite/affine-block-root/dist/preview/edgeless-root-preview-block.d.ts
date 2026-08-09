import { type SurfaceBlockComponent, type SurfaceBlockModel } from '@blocksuite/affine-block-surface';
import type { RootBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
import { type GfxViewportElement } from '@blocksuite/std/gfx';
import { type StyleInfo } from 'lit/directives/style-map.js';
export declare class EdgelessRootPreviewBlockComponent extends BlockComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private get _viewport();
    private readonly _refreshLayerViewport;
    private _resizeObserver;
    private get _gfx();
    get surfaceBlockModel(): SurfaceBlockModel;
    get viewportElement(): HTMLElement;
    private _initFontLoader;
    private _initLayerUpdateEffect;
    private _initPixelRatioChangeEffect;
    private _initResizeEffect;
    private _initSlotEffects;
    private get _disableScheduleUpdate();
    private get _crud();
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor overrideBackground: string | undefined;
    accessor backgroundStyle: Readonly<StyleInfo> | null;
    accessor gfxViewportElm: GfxViewportElement;
    accessor surface: SurfaceBlockComponent;
}
//# sourceMappingURL=edgeless-root-preview-block.d.ts.map